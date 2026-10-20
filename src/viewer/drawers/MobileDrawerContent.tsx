"use client";
import React, {
  useMemo,
  useState,
  useCallback,
  useEffect,
  useRef,
} from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import VirtualTourInteractiveView from "@/viewer/virtual/VirtualTourInteractiveView";
import { EntityTypeEnum } from "@enums/EntityTypeEnum";
import { TabEnum } from "@enums/TabEnum";
import {
  Box,
  Typography,
  Stack,
  IconButton,
  Divider,
  Card,
  Tooltip,
  Paper,
} from "@mui/material";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ShareIcon from "@mui/icons-material/IosShare";
import { Circle } from "@mui/icons-material";
import FloorIcon from "@/assets/svgs/FloorIcon";
import UnitNumberIcon from "@/assets/svgs/UnitNumberIcon";
import GrossIcon from "@/assets/svgs/GrossIcon";
import { useAppSelector, useAppDispatch } from "@redux/hooks";
import { setCurrentSceneId } from "@redux/appSlice";
import { IUnitItem } from "@/types/IUnitItem";
import { IUnitTypeModel } from "@/types/IUnitTypeModel";
import UnitDrawer from "./UnitDrawer";
import { getFloorText } from "@helpers/Common/getOrdinalNumber";
import { getFacadeDirection } from "@helpers/Common/getFacadeDirection";
import { useFavorites } from "@/hooks/useFavorites";
import { useUnitAreaFields } from "@hooks/useUnitAreaFields";
import { handleNativeShare } from "@helpers/Common/handleNativeShare";

interface MobileDrawerContentProps {
  currentTab: string;
}

const MobileDrawerContent: React.FC<MobileDrawerContentProps> = ({
  currentTab,
}) => {
  const {
    presentationContentResponse,
    selectedUnitId,
    presentationInitResponse,
    currentSceneId,
  } = useAppSelector((state) => state.AppReducer);

  const dispatch = useAppDispatch();
  const t = useTranslations("Common");
  const { label: areaLabel, isHidden: isAreaHidden } = useUnitAreaFields();
  const params = useParams<any>();
  const activeTab = useAppSelector((state) => state.AppReducer.activeTab);
  const { locale } = params;
  const { toggleFavorite, isUnitFavorited } = useFavorites(
    presentationInitResponse?.projectId
  );
  const [imageError, setImageError] = useState(false);
  const [containerDimensions, setContainerDimensions] = useState({
    width: 300,
    height: 300,
  });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      const updateDimensions = () => {
        setContainerDimensions({
          width: containerRef.current?.offsetWidth || 300,
          height: containerRef.current?.offsetHeight || 300,
        });
      };

      updateDimensions();
      window.addEventListener("resize", updateDimensions);

      return () => window.removeEventListener("resize", updateDimensions);
    }
    return undefined;
  }, []);

  const units: any[] = useMemo(
    () => presentationContentResponse || [],
    [presentationContentResponse]
  );

  const selectedUnit: IUnitItem = selectedUnitId
    ? units.find((unit) => unit.id === selectedUnitId)
    : null;

  const isFavorite = selectedUnit ? isUnitFavorited(selectedUnit.id) : false;

  const unitTemplates = useMemo(
    () => presentationInitResponse?.unitTemplates || [],
    [presentationInitResponse?.unitTemplates]
  );

  const unitTypes = useMemo(
    () => presentationInitResponse?.unitTypes || [],
    [presentationInitResponse?.unitTypes]
  );

  const selectedUnitState = presentationInitResponse?.unitStates?.find(
    (state) => state.id === selectedUnit?.currentStateId
  );

  const selectedUnitTemplate = unitTemplates.find(
    (template) => template.id === selectedUnit?.templateId
  );

  const getRoomName = (unit: IUnitItem | null): string => {
    const unitType = unitTypes?.find(
      (type: IUnitTypeModel) => type.id === unit?.unitTypeId
    );
    return unitType?.name || "N/A";
  };

  const handleShare = () => {
    handleNativeShare({
      unitName: selectedUnit
        ? selectedUnit?.block?.name + " " + selectedUnit?.unitNumber
        : undefined,
      projectName: presentationInitResponse?.projectName,
      t,
      presentationInitResponse,
    });
  };

  const getNetArea = useCallback(
    (unit: IUnitItem | null): number => {
      const templateUnit = unitTemplates.find(
        (template) => template.id === unit?.templateId
      );

      return templateUnit?.netArea || unit?.netArea || 0;
    },
    [unitTemplates]
  );

  const getGrossArea = useCallback(
    (unit: IUnitItem | null): number => {
      const templateUnit = unitTemplates.find(
        (template) => template.id === unit?.templateId
      );
      return templateUnit?.grossArea || unit?.grossArea || 0;
    },
    [unitTemplates]
  );

  const renderInfoItem = useCallback(
    (label: string, value: string | number) => (
      <>
        <Stack
          key={label}
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ p: 2 }}
        >
          <Typography variant="body2" color="text.secondary">
            {label}
          </Typography>
          <Typography variant="body2" fontWeight={600}>
            {value}
          </Typography>
        </Stack>
        <Divider sx={{ borderStyle: "dashed" }} />
      </>
    ),
    []
  );

  if (selectedUnit) {
    return (
      <Box sx={{ height: "100%" }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ px: 2, py: 1.5 }}
        >
          <Tooltip title={selectedUnitState?.name || "N/A"}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Circle sx={{ color: selectedUnitState?.color }} />
              <Typography fontSize={18} fontWeight={600} color="primary.main">
                {String(
                  (selectedUnit?.block.name || "") +
                    " - " +
                    (selectedUnit?.unitNumber || "") || "N/A"
                )}
              </Typography>
            </Stack>
          </Tooltip>
          <Stack direction="row" spacing={1}>
            <Tooltip title={t("ShareLink")} arrow>
              <IconButton
                onClick={handleShare}
                sx={{
                  color: "grey.400",
                  "&:hover": {
                    color: "primary.main",
                  },
                }}
              >
                <ShareIcon />
              </IconButton>
            </Tooltip>
            <IconButton
              onClick={() => selectedUnit && toggleFavorite(selectedUnit)}
              sx={{
                color: isFavorite ? "error.main" : "grey.400",
                "&:hover": {
                  color: "error.main",
                },
              }}
            >
              {isFavorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
            </IconButton>
          </Stack>
        </Stack>

        <Paper
          elevation={0}
          ref={containerRef}
          sx={{
            m: 2,
            mb: 3,
            borderRadius: 3,
            overflow: "hidden",
            background: "transparent",
            cursor: "pointer",
            transition: "transform 0.2s ease-in-out",
            "&:hover": {
              transform: "scale(1.02)",
            },
          }}
        >
          <Box
            sx={{
              position: "relative",
              width: "100%",
              height: 300,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {activeTab === TabEnum.VirtualTour ? (
              <VirtualTourInteractiveView
                containerWidth={containerDimensions.width}
                containerHeight={containerDimensions.height}
                currentSceneId={currentSceneId || undefined}
                onSceneChange={(sceneId) =>
                  dispatch(setCurrentSceneId(sceneId))
                }
                EntityType={EntityTypeEnum.UnitTemplate}
                EntityId={selectedUnit?.templateId?.toString()}
              />
            ) : (
              <Image
                src={
                  imageError
                    ? "/placeholder.png"
                    : selectedUnitTemplate?.image?.url || "/placeholder.png"
                }
                alt={`Unit ${selectedUnit?.name} floor plan`}
                fill
                style={{
                  width: "100%",
                  height: "100%",
                }}
                onError={() => setImageError(true)}
              />
            )}
          </Box>
        </Paper>

        <Box
          sx={{
            flex: 1,
            overflow: "auto",
            p: 2,
            "&::-webkit-scrollbar": {
              display: "none",
            },
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
            <Card
              elevation={0}
              sx={{
                flex: 1,
                p: 2,
                borderRadius: 2,
                textAlign: "center",
                backgroundColor: "card2.main",
              }}
            >
              <FloorIcon color="action" />
              <Typography variant="body2">
                {selectedUnit?.floor?.number
                  ? getFloorText(selectedUnit.floor.number, locale || "en", t)
                  : "N/A"}
              </Typography>
            </Card>

            <Card
              elevation={0}
              sx={{
                flex: 1,
                p: 2,
                borderRadius: 2,
                textAlign: "center",
                backgroundColor: "card2.main",
              }}
            >
              <UnitNumberIcon color="action" />
              <Typography variant="body2">
                {getRoomName(selectedUnit) || "N/A"}
              </Typography>
            </Card>

            {/* Brüt alanı gizleyen projede çip çizilmez; diğer kartlar flex:1 ile yayılır. */}
            {!isAreaHidden("grossArea") && (
              <Card
                elevation={0}
                sx={{
                  flex: 1,
                  p: 2,
                  borderRadius: 2,
                  textAlign: "center",
                  backgroundColor: "card2.main",
                }}
              >
                <GrossIcon color="action" />
                <Typography variant="body2">{`${getGrossArea(
                  selectedUnit
                )} m²`}</Typography>
              </Card>
            )}
          </Stack>

          <Box
            sx={{
              borderRadius: 2,
              overflow: "hidden",
            }}
          >
            {renderInfoItem(t("Status"), selectedUnitState?.name || "N/A")}
            {renderInfoItem(t("Stage"), selectedUnit?.stage?.name || "N/A")}
            {renderInfoItem(t("Block"), selectedUnit?.block?.name || "N/A")}
            {renderInfoItem(t("UnitType"), selectedUnit?.name || "N/A")}
            {!isAreaHidden("netArea") &&
              renderInfoItem(
                areaLabel("netArea"),
                `${getNetArea(selectedUnit)} m²`
              )}
            {!isAreaHidden("grossArea") &&
              renderInfoItem(
                areaLabel("grossArea"),
                `${getGrossArea(selectedUnit)} m²`
              )}
            {renderInfoItem(
              t("Facade"),
              String(getFacadeDirection(selectedUnit, t))
            )}
            {renderInfoItem(t("Room"), getRoomName(selectedUnit) || "N/A")}
            {selectedUnitTemplate?.specifications?.map((spec) =>
              renderInfoItem(spec.name, spec.value || "N/A")
            )}
          </Box>
        </Box>
      </Box>
    );
  }

  return <UnitDrawer />;
};

export default MobileDrawerContent;
