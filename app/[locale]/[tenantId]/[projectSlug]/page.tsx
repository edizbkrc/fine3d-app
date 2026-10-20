import axiosInstance from "@network/axiosInstance";
import { OpsApiRoutes } from "@network/OpsApiRoutes";
import getAcceptLanguage from "@helpers/Auth/getAcceptLanguage";
import { EntityTypeEnum } from "@enums/EntityTypeEnum";
import { IPresentationInitResponse } from "@/types/IPresentationInitResponse";
import { IBaseResponse } from "@/types/IBaseResponse";
import { IPresentationResponse } from "@/types/IPresentationResponse";
import Presentation from "@/viewer/layout/Presentation";
import NotFoundComponent from "@/components/NotFoundComponent";
import { getSlugVariants } from "@/helpers/Common/slugVariants";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

async function fetchPresentationInit(
  TenantId: string,
  ProjectSlug: string,
  locale: string,
) {
  try {
    return await axiosInstance.get<IBaseResponse<IPresentationInitResponse>>(
      OpsApiRoutes.GetPresentationInit,
      {
        params: { TenantId, ProjectSlug },
        headers: { "Accept-Language": getAcceptLanguage(locale) },
      },
    );
  } catch {
    return null;
  }
}

async function resolvePresentationInit(
  TenantId: string,
  ProjectSlug: string,
  locale: string,
) {
  for (const slug of getSlugVariants(ProjectSlug)) {
    const response = await fetchPresentationInit(TenantId, slug, locale);
    if (response?.data?.isSuccess && response.data.data) {
      return { response, resolvedSlug: slug };
    }
  }
  return null;
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; tenantId: string; projectSlug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}): Promise<Metadata> {
  const { locale, tenantId, projectSlug } = await params;
  const TenantId = decodeURIComponent(tenantId);
  const ProjectSlug = decodeURIComponent(projectSlug);

  try {
    const PresentationInitResponse = await axiosInstance.get<
      IBaseResponse<IPresentationInitResponse>
    >(OpsApiRoutes.GetPresentationInit, {
      params: {
        TenantId,
        ProjectSlug,
      },
      headers: {
        "Accept-Language": getAcceptLanguage(locale),
      },
    });

    const initData = PresentationInitResponse?.data?.data;
    const projectName = initData?.projectName || "Fine3D";
    const projectSlogan = initData?.projectSlogan || "";
    const description = projectSlogan || `${projectName} - Fine3D Projesi`;

    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL || "https://t-app.fine3d.com.tr";
    const currentUrl = `${baseUrl}/${locale}/${tenantId}/${projectSlug}`;

    return {
      title: `${projectName} - Fine3D`,
      description: description,
      openGraph: {
        title: `${projectName} - Fine3D`,
        description: description,
        url: currentUrl,
        siteName: "Fine3D",
        images: [
          {
            url: `${baseUrl}/favicon-1200x630.png`,
            width: 1200,
            height: 630,
            alt: projectName,
          },
          {
            url: `${baseUrl}/favicon-512x512.png`,
            width: 512,
            height: 512,
            alt: projectName,
          },
          {
            url: `${baseUrl}/favicon-192x192.png`,
            width: 192,
            height: 192,
            alt: projectName,
          },
          {
            url: `${baseUrl}/favicon-180x180.png`,
            width: 180,
            height: 180,
            alt: projectName,
          },
        ],
        locale: locale,
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title: `${projectName} - Fine3D`,
        description: description,
        images: [`${baseUrl}/favicon-1200x630.png`],
      },
      metadataBase: new URL(baseUrl),
    };
  } catch (error) {
    return {
      title: "Fine3D",
      description: "3D Proje Görünümü",
    };
  }
}

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; tenantId: string; projectSlug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { locale, tenantId, projectSlug } = await params;
  const searchParamsResolved = await searchParams;
  const TenantId = decodeURIComponent(tenantId);
  const ProjectSlug = decodeURIComponent(projectSlug);

  const queryEntityType = Array.isArray(searchParamsResolved?.entityType)
    ? searchParamsResolved.entityType[0]
    : searchParamsResolved?.entityType;
  const queryEntityId = Array.isArray(searchParamsResolved?.entityId)
    ? searchParamsResolved.entityId[0]
    : searchParamsResolved?.entityId;
  const querySelectedUnitId = Array.isArray(
    searchParamsResolved?.selectedUnitId,
  )
    ? searchParamsResolved.selectedUnitId[0]
    : searchParamsResolved?.selectedUnitId;
  const queryProjectStageId = Array.isArray(
    searchParamsResolved?.projectStageId,
  )
    ? searchParamsResolved.projectStageId[0]
    : searchParamsResolved?.projectStageId;

  const resolved = await resolvePresentationInit(TenantId, ProjectSlug, locale);
  if (!resolved) {
    return (
      <NotFoundComponent
        title="Sunum bulunamadı"
        message={`Proje yüklenemedi (tenant: ${TenantId}). Local Hub çalışıyor mu ve URL slug doğru mu kontrol edin.`}
      />
    );
  }

  const PresentationInitResponse = resolved.response;
  // Tarayıcı ı→i bozduysa doğru slug'a yönlendir
  if (resolved.resolvedSlug !== ProjectSlug) {
    const qs = new URLSearchParams();
    Object.entries(searchParamsResolved || {}).forEach(([key, value]) => {
      if (typeof value === "string") qs.set(key, value);
      else if (Array.isArray(value) && value[0]) qs.set(key, value[0]);
    });
    const query = qs.toString();
    redirect(
      `/${locale}/${encodeURIComponent(TenantId)}/${encodeURIComponent(resolved.resolvedSlug)}${query ? `?${query}` : ""}`,
    );
  }

  const initData = PresentationInitResponse?.data?.data;

  let entityType = initData?.startingEntity;
  let entityId: string | number = initData?.projectId;
  let selectedUnitId: number | null = null;
  let projectStageId: string | undefined = queryProjectStageId;

  if (
    initData?.startingEntity === EntityTypeEnum.ProjectStage &&
    initData?.initialStageId
  ) {
    entityId = initData.initialStageId;
    projectStageId = String(initData.initialStageId);
  } else if (
    initData?.startingEntity !== EntityTypeEnum.ProjectStage &&
    initData?.startingEntity !== EntityTypeEnum.Project
  ) {
    projectStageId = String(initData.initialStageId);
  }

  if (queryEntityType && queryEntityId) {
    const parsedEntityType = parseInt(queryEntityType, 10);
    if (
      !isNaN(parsedEntityType) &&
      Object.values(EntityTypeEnum).includes(parsedEntityType)
    ) {
      entityType = parsedEntityType as EntityTypeEnum;
      entityId = queryEntityId;
    }
  }

  if (querySelectedUnitId) {
    const parsedSelectedUnitId = parseInt(querySelectedUnitId, 10);
    if (!isNaN(parsedSelectedUnitId)) {
      selectedUnitId = parsedSelectedUnitId;
    }
  }

  const GeneralParams = {
    TenantId,
    ProjectSlug,
    ProjectId: initData?.projectId,
    EntityType: entityType,
    EntityId: entityId,
  };

  const ContentBarParams = {
    TenantId,
    ProjectSlug,
    ProjectId: initData?.projectId,
    EntityType:
      entityType === EntityTypeEnum.Project
        ? EntityTypeEnum.Project
        : EntityTypeEnum.ProjectStage,
    ProjectStageId:
      entityType === EntityTypeEnum.ProjectStage
        ? entityId
        : projectStageId || undefined,
  };

  const headers = {
    "Accept-Language": getAcceptLanguage(locale),
  };

  try {
    const promises = [
      axiosInstance.get<IBaseResponse<IPresentationResponse>>(
        OpsApiRoutes.GetPresentations,
        { params: GeneralParams, headers },
      ),
      axiosInstance.get(OpsApiRoutes.GetPresentationTabBar, {
        params: ContentBarParams,
        headers,
      }),
      axiosInstance.get(OpsApiRoutes.GetPresentationContent, {
        params: ContentBarParams,
        headers,
      }),
      axiosInstance.get(OpsApiRoutes.GetPresentationContent, {
        params: {
          TenantId,
          ProjectSlug,
          ProjectId: initData?.projectId,
          EntityType: EntityTypeEnum.Block,
          ProjectStageId:
            entityType === EntityTypeEnum.ProjectStage
              ? entityId
              : projectStageId || undefined,
        },
        headers,
      }),
      axiosInstance.get(OpsApiRoutes.GetPresentationContent, {
        params: {
          TenantId,
          ProjectSlug,
          ProjectId: initData?.projectId,
          EntityType: EntityTypeEnum.Project,
          ProjectStageId:
            entityType === EntityTypeEnum.ProjectStage
              ? entityId
              : projectStageId || undefined,
        },
        headers,
      }),
    ];

    const responses = await Promise.all(promises);
    const PresentationResponse = responses[0];
    const TabBarContentResponse = responses[1];
    const PresentationContentResponse = responses[2];
    const ProjectBlockContentResponse = responses[3];
    const ProjectContentResponse = responses[4];

    return (
      <Presentation
        presentationInitResponse={PresentationInitResponse?.data?.data || null}
        presentationResponse={PresentationResponse?.data?.data || null}
        tabBarContentResponse={TabBarContentResponse?.data?.data || null}
        presentationContentResponse={PresentationContentResponse?.data?.data}
        projectBlockContent={ProjectBlockContentResponse?.data?.data || null}
        projectContent={ProjectContentResponse?.data?.data || null}
        currentEntityType={entityType}
        currentEntityId={entityId}
        selectedUnitId={selectedUnitId}
        tenantId={TenantId}
        projectSlug={ProjectSlug}
        projectId={initData?.projectId}
        projectStageId={projectStageId}
      />
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Sunum verisi alınamadı";
    return (
      <NotFoundComponent
        title="Sunum yüklenirken bir hata oluştu"
        message={`${message}. Local API: ${process.env.NEXT_PUBLIC_API_URL || "?"}`}
      />
    );
  }
}
