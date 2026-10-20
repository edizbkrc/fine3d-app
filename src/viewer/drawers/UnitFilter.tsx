"use client";

import React, { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useUnitAreaFields } from "@hooks/useUnitAreaFields";
import {
  Box,
  Typography,
  Chip,
  Slider,
  Select,
  MenuItem,
  Collapse,
  IconButton,
  Stack,
  Paper,
  SelectChangeEvent,
  FormControl,
  InputLabel,
  Checkbox,
  ListItemText,
  useMediaQuery,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { IUnitState } from "@/types/IUnitState";

export interface FilterValues {
  roomCount: string[];
  floorRange: [number, number];
  areaRange: [number, number];
  status: string;
  direction: string[];
}

interface UnitFilterProps {
  initialValues?: Partial<FilterValues>;
  onFilterChange: (filters: FilterValues) => void;
  roomOptions?: string[];
  unitStates?: IUnitState[];
  directionOptions?: Array<{ value: string; label: string }>;
  floorMax?: number;
  areaMax?: number;
  isCollapsed?: boolean;
  "data-tour"?: string;
}
export default function UnitFilter({
  initialValues = {},
  onFilterChange,
  roomOptions = [],
  unitStates = [],
  directionOptions = [],
  floorMax = 6,
  areaMax = 6,
  isCollapsed = true,
  "data-tour": dataTour,
}: UnitFilterProps) {
  const t = useTranslations("Common");
  const { label: areaLabel, isHidden: isAreaHidden } = useUnitAreaFields();

  const safeFloorMax = isNaN(floorMax) || floorMax <= 0 ? 10 : floorMax;
  const safeAreaMax = isNaN(areaMax) || areaMax <= 0 ? 300 : areaMax;

  const getDefaultValues = (): FilterValues => ({
    roomCount: [],
    floorRange: [0, safeFloorMax],
    areaRange: [0, safeAreaMax],
    status: "",
    direction: [],
  });

  const [filters, setFilters] = useState<FilterValues>({
    ...getDefaultValues(),
    ...initialValues,
  });

  const isMobile = useMediaQuery("(max-width: 768px)");
  const [collapsed, setCollapsed] = useState(isCollapsed);

  const updateFilters = useCallback(
    (newFilters: Partial<FilterValues>) => {
      const updatedFilters = { ...filters, ...newFilters };
      setFilters(updatedFilters);
      onFilterChange(updatedFilters);
    },
    [filters, onFilterChange]
  );

  const handleRoomCountChange = useCallback(
    (room: string) => {
      const currentRooms = filters.roomCount;
      const newRooms = currentRooms.includes(room)
        ? currentRooms.filter((r) => r !== room)
        : [...currentRooms, room];

      updateFilters({ roomCount: newRooms });
    },
    [filters.roomCount, updateFilters]
  );

  const handleFloorChange = useCallback(
    (_: Event, newValue: number | number[]) => {
      updateFilters({ floorRange: newValue as [number, number] });
    },
    [updateFilters]
  );

  const handleAreaChange = useCallback(
    (_: Event, newValue: number | number[]) => {
      updateFilters({ areaRange: newValue as [number, number] });
    },
    [updateFilters]
  );

  const handleStatusChange = useCallback(
    (event: SelectChangeEvent) => {
      updateFilters({ status: event.target.value });
    },
    [updateFilters]
  );

  const handleDirectionChange = useCallback(
    (event: SelectChangeEvent<string[]>) => {
      const value = event.target.value;
      updateFilters({
        direction: typeof value === "string" ? value.split(",") : value,
      });
    },
    [updateFilters]
  );

  return (
    <Paper
      elevation={0}
      data-tour={dataTour}
      sx={{
        p: { xs: 0, md: 2 },
        pt: { xs: 0, md: 1 },
        borderRadius: 1.5,
        backgroundColor: "background.paper",
        pb: 0,
      }}
    >
      <Box
        sx={{
          display: { xs: "none", md: "flex" },
          justifyContent: "space-between",
          alignItems: "center",
          cursor: "pointer",
        }}
        onClick={() => setCollapsed(!collapsed)}
      >
        <Typography
          variant="subtitle1"
          sx={{
            fontWeight: 600,
            color: "text.primary",
            fontSize: "1rem",
          }}
        >
          {t("Filters")}
        </Typography>

        <IconButton size="small">
          {collapsed ? <ExpandMoreIcon /> : <ExpandLessIcon />}
        </IconButton>
      </Box>

      <Collapse in={isMobile || !collapsed}>
        <Stack spacing={2.5}>
          <Box>
            <Typography
              variant="body2"
              sx={{ mb: 1.5, fontWeight: 500, color: "text.primary" }}
            >
              {t("RoomCount")}
            </Typography>

            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {roomOptions.map((room) => (
                <Chip
                  key={room}
                  label={room}
                  variant={
                    filters.roomCount.includes(room) ? "filled" : "outlined"
                  }
                  color={
                    filters.roomCount.includes(room) ? "primary" : "default"
                  }
                  onClick={() => handleRoomCountChange(room)}
                  size="small"
                  sx={{
                    borderRadius: 6,
                    px: 1.5,
                    py: 0.5,
                    fontSize: "0.75rem",
                    fontWeight: 500,
                    cursor: "pointer",
                    transition: "all 0.2s ease-in-out",
                    "&:hover": {
                      transform: "translateY(-1px)",
                      boxShadow: 1,
                    },
                  }}
                />
              ))}
            </Stack>
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
              gap: 2.5,
            }}
          >
            <Box>
              <Typography
                variant="body2"
                sx={{ mb: 1.5, fontWeight: 500, color: "text.primary" }}
              >
                {t("Floor")}
              </Typography>

              <Box sx={{ px: 1.5 }}>
                <Slider
                  value={filters.floorRange}
                  onChange={handleFloorChange}
                  valueLabelDisplay="auto"
                  min={0}
                  max={safeFloorMax}
                  size="small"
                  marks={[
                    { value: 0, label: "0" },
                    {
                      value: safeFloorMax,
                      label: safeFloorMax.toFixed(0).toString(),
                    },
                  ]}
                />
              </Box>
            </Box>

            {/* Bu slider UnitDrawer'da NET alana göre filtreliyor (getNetArea); etiket eskiden
                yanlışlıkla "Brüt" yazıyordu, bu yüzden netArea etiketine bağlandı. Net alanı gizli
                projede slider anlamsız (değerler 0 ve filtreden muaf), hiç gösterilmez. */}
            {!isAreaHidden("netArea") && (
              <Box>
                <Typography
                  variant="body2"
                  sx={{ mb: 1.5, fontWeight: 500, color: "text.primary" }}
                >
                  {areaLabel("netArea")}
                </Typography>

                <Box sx={{ px: 1.5 }}>
                  <Slider
                    value={filters.areaRange}
                    onChange={handleAreaChange}
                    valueLabelDisplay="auto"
                    min={0}
                    max={safeAreaMax}
                    size="small"
                    marks={[
                      { value: 0, label: "0" },
                      { value: safeAreaMax, label: safeAreaMax.toString() },
                    ]}
                  />
                </Box>
              </Box>
            )}
          </Box>

          <Stack direction={{ xs: "column", md: "row" }} spacing={2} pb={1}>
            <FormControl fullWidth size="small">
              <InputLabel id="status-label" sx={{ fontSize: "0.8rem" }}>
                {t("Status")}
              </InputLabel>
              <Select
                labelId="status-label"
                value={filters.status}
                onChange={handleStatusChange}
                label={t("Status")}
                sx={{
                  borderRadius: 5,
                  fontSize: "0.8rem",
                  "& .MuiSelect-select": {
                    py: 1,
                  },
                }}
              >
                <MenuItem value="" sx={{ fontSize: "0.8rem" }}>
                  <em>
                    {t("Clear")} {t("Status")}
                  </em>
                </MenuItem>
                {unitStates.map((option) => (
                  <MenuItem
                    key={option?.id}
                    value={option?.id?.toString()}
                    sx={{ fontSize: "0.8rem" }}
                  >
                    {option?.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth size="small">
              <InputLabel id="direction-label" sx={{ fontSize: "0.8rem" }}>
                {t("Facade")}
              </InputLabel>
              <Select
                labelId="direction-label"
                multiple
                value={filters.direction}
                onChange={handleDirectionChange}
                label={t("Facade")}
                renderValue={(selected) => {
                  if (selected.length === 0) {
                    return <em>{t("Facade")}</em>;
                  }
                  return directionOptions
                    .filter((opt) => selected.includes(opt.value))
                    .map((opt) => opt.label)
                    .join(", ");
                }}
                sx={{
                  borderRadius: 5,
                  fontSize: "0.8rem",
                  "& .MuiSelect-select": {
                    py: 1,
                  },
                }}
              >
                {directionOptions.map((option) => (
                  <MenuItem
                    key={option.value}
                    value={option.value}
                    sx={{ fontSize: "0.8rem" }}
                  >
                    <Checkbox
                      checked={filters.direction.includes(option.value)}
                      size="small"
                    />
                    <ListItemText primary={option.label} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </Stack>
      </Collapse>
    </Paper>
  );
}
