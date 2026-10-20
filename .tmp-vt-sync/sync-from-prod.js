const fs = require("fs");
const path = require("path");
const https = require("https");

function get(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, { headers: { "Accept-Language": "tr-TR" } }, (res) => {
        let d = "";
        res.on("data", (c) => (d += c));
        res.on("end", () => {
          try {
            // Snowflake ids > 2^53 lose precision as JSON numbers — quote them first
            const safe = d.replace(
              /"(id|Id)"\s*:\s*(\d{15,})\b/g,
              '"$1":"$2"',
            );
            resolve(JSON.parse(safe));
          } catch (e) {
            reject(e);
          }
        });
      })
      .on("error", reject);
  });
}

function stripCdn(url) {
  if (!url) return "";
  return String(url).replace(/^https?:\/\/cdn\.finegroup\.com\.tr\/?/i, "");
}

function toDbTour(tour) {
  // Snowflake ids must stay as strings in JS to avoid Number precision loss
  return {
    Id: String(tour.id),
    Translations: [{ LanguageId: 1, Name: tour.name || "" }],
    ImagesBasePath: null,
    TileImagesBasePath: null,
    Scenes: (tour.scenes || []).map((s) => ({
      Id: s.id,
      Translations: [{ LanguageId: 1, Name: s.name || "", Description: null }],
      Image: s.image
        ? {
            Url: s.image.url,
            AltText: s.image.altText || null,
            FilePath: stripCdn(s.image.url),
          }
        : null,
      NightImage: null,
      TilesBasePath: stripCdn(s.tilesBaseUrl),
      TileConfigPath: stripCdn(s.tileConfigUrl),
      FaceSize: s.faceSize ?? null,
      Hotspots: (s.hotspots || []).map((h) => ({
        Id: h.id,
        Translations: [
          {
            LanguageId: 1,
            Title: h.title || "",
            Content: h.content || "",
            Text: h.text || "",
          },
        ],
        Type: h.type,
        Yaw: h.yaw,
        Pitch: h.pitch,
        Rotation: h.rotation,
        TargetScene: h.targetScene,
      })),
      InitialViewParameters: s.initialViewParameters || {
        yaw: 0,
        pitch: 0,
        fov: 60,
      },
    })),
    ViewerSettings: {
      MouseViewMode: tour.viewerSettings?.mouseViewMode ?? null,
      AutorotateEnabled: !!tour.viewerSettings?.autorotateEnabled,
      FullscreenButton: !!tour.viewerSettings?.fullscreenButton,
      ViewControlButtons: !!tour.viewerSettings?.viewControlButtons,
      InitialSceneId:
        tour.viewerSettings?.initialSceneId ||
        "00000000-0000-0000-0000-000000000000",
    },
  };
}

function sqlEscape(s) {
  return s.replace(/'/g, "''");
}

(async () => {
  const tenant = "dekorinsaat_1";
  const slug = encodeURIComponent("royalkonutları-YnA6E-lzjqthshKc");
  const init = await get(
    `https://api.finegroup.com.tr/hubapi/v1/presentations/presentation/init?TenantId=${tenant}&ProjectSlug=${slug}`,
  );
  const outDir = __dirname;
  const statements = [];

  for (const ut of init.data.unitTemplates || []) {
    const tours = (ut.virtualTours || []).map(toDbTour);
    const json = JSON.stringify(tours);
    statements.push(
      `UPDATE "UnitTemplates" SET "VirtualTours" = '${sqlEscape(json)}'::jsonb WHERE "Id" = ${ut.id};`,
    );
    console.log(
      "UT",
      ut.id,
      "tours",
      tours.length,
      "scenes",
      tours[0]?.Scenes?.length,
    );
  }

  const projTours = (init.data.projectVirtualTours || []).map(toDbTour);
  const pjson = JSON.stringify(projTours);
  statements.push(
    `UPDATE "FineProjects" SET "VirtualTours" = '${sqlEscape(pjson)}'::jsonb WHERE "Id" = 23;`,
  );
  console.log(
    "project tours",
    projTours.length,
    "scenes",
    projTours[0]?.Scenes?.length,
  );

  const sqlPath = path.join(outDir, "sync-all.sql");
  fs.writeFileSync(sqlPath, statements.join("\n"), "utf8");
  console.log("wrote", sqlPath, "bytes", fs.statSync(sqlPath).size);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
