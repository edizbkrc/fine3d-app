"use client";
import React from "react";
import { useTranslations } from "next-intl";
import { useUnitAreaFields } from "@hooks/useUnitAreaFields";
import { useForm, Controller } from "react-hook-form";
import Image from "next/image";
import { Turnstile } from "@marsidev/react-turnstile";
import { useAppSelector } from "@redux/hooks";
import { IPresentationInitResponse } from "@/types/IPresentationInitResponse";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Alert,
  CircularProgress,
  IconButton,
  Typography,
  Box,
  Stack,
  useMediaQuery,
  Card,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import TelInput from "@components/TelInput";
import { getFacadeDirection } from "@helpers/Common/getFacadeDirection";
import RealEstateAgentIcon from "@mui/icons-material/RealEstateAgent";

interface ContactFormData {
  nameSurname: string;
  email: string;
  phoneNumber: string;
  message: string;
  unitId: number | null;
  captchaToken: string;
}

interface ContactFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: ContactFormData) => void;
  loading: boolean;
  error: string | null;
  success: boolean;
  selectedUnit?: any;
  showUnitCard: boolean;
  setShowUnitCard: (show: boolean) => void;
}

const ContactFormDialog: React.FC<ContactFormDialogProps> = ({
  open,
  onClose,
  onSubmit,
  loading,
  error,
  success,
  selectedUnit,
  showUnitCard,
  setShowUnitCard,
}) => {
  const t = useTranslations("Common");
  const { label: areaLabel, isHidden: isAreaHidden } = useUnitAreaFields();
  const isMobile = useMediaQuery("(max-width: 768px)");

  const { presentationInitResponse } = useAppSelector(
    (state) => state.AppReducer
  );

  const initResponse =
    presentationInitResponse || ({} as IPresentationInitResponse);
  const unitTypes = initResponse?.unitTypes || [];
  const unitTemplates = initResponse?.unitTemplates || [];

  const unitTemplate = unitTemplates?.find(
    (template: any) => template?.id === selectedUnit?.templateId
  );

  const getRoomName = (unit: any): string => {
    const unitType = unitTypes?.find(
      (type: any) => type.id === unit.unitTypeId
    );
    return unitType?.name || "N/A";
  };

  const getNetAreaFromTemplate = (unit: any): number => {
    return unit?.netArea || 0;
  };

  const getGrossAreaFromTemplate = (unit: any): number => {
    return unit?.grossArea || 0;
  };

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm<ContactFormData>({
    defaultValues: {
      nameSurname: "",
      email: "",
      phoneNumber: "",
      message: "",
      unitId: selectedUnit?.id || null,
      captchaToken: "",
    },
  });

  const onSubmitForm = (data: ContactFormData) => {
    if (!data.captchaToken) {
      return;
    }
    onSubmit(data);
  };

  React.useEffect(() => {
    if (success) {
      reset();
      setValue("captchaToken", "");
    }
  }, [success, reset, setValue]);

  React.useEffect(() => {
    if (selectedUnit?.id) {
      setValue("unitId", selectedUnit.id);
    }
  }, [selectedUnit, setValue]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      fullScreen={isMobile}
      sx={{
        zIndex: 99999,
        "& .MuiDialog-paper": {
          borderRadius: isMobile ? 0 : "16px",
          m: isMobile ? 0 : 2,
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          pb: 1,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <RealEstateAgentIcon color="primary" />
          <Typography variant="h6" fontWeight={600}>
            {t("GetQuote")}
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        {selectedUnit && showUnitCard && (
          <Card
            elevation={4}
            sx={{
              mb: 2,
              borderRadius: 3,
              bgcolor: "card2.main",
              position: "relative",
              boxShadow: "0 4px 16px rgba(0, 0, 0, 0.1)",
            }}
          >
            <IconButton
              onClick={() => setShowUnitCard(false)}
              size="small"
              sx={{
                position: "absolute",
                top: 8,
                right: 8,
                bgcolor: "rgba(255, 255, 255, 0.9)",
                zIndex: 10,
                "&:hover": {
                  bgcolor: "rgba(255, 255, 255, 1)",
                  transform: "scale(1.05)",
                },
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>

            <Stack direction="row" spacing={2} sx={{ p: 2 }}>
              <Box
                sx={{
                  width: 200,
                  height: 150,
                  borderRadius: 2,
                  bgcolor: "white",
                  flexShrink: 0,
                  p: 0.5,
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <Image
                  src={unitTemplate?.image?.url || "/placeholder.png"}
                  alt={`Unit ${
                    selectedUnit?.block.name + " - " + selectedUnit?.unitNumber
                  } floor plan`}
                  fill
                  style={{
                    objectFit: "contain",
                  }}
                  sizes="150px"
                />
              </Box>

              <Stack spacing={1} sx={{ flex: 1 }}>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography variant="h6" fontWeight={600} sx={{ pr: 4 }}>
                    {String(
                      selectedUnit?.block.name +
                        " - " +
                        selectedUnit?.unitNumber || "N/A"
                    )}
                  </Typography>
                </Stack>

                <Stack spacing={0.5}>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">
                      {t("Floor")}
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {selectedUnit.floor?.number?.toString() || "N/A"}
                    </Typography>
                  </Stack>

                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">
                      {t("Room")}
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {getRoomName(selectedUnit)}
                    </Typography>
                  </Stack>

                  {!isAreaHidden("netArea") && (
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">
                        {areaLabel("netArea")}
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {getNetAreaFromTemplate(selectedUnit)}
                      </Typography>
                    </Stack>
                  )}

                  {!isAreaHidden("grossArea") && (
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">
                        {areaLabel("grossArea")}
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {getGrossAreaFromTemplate(selectedUnit)}
                      </Typography>
                    </Stack>
                  )}

                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">
                      {t("Facade")}
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {getFacadeDirection(selectedUnit, t)}
                    </Typography>
                  </Stack>
                </Stack>
              </Stack>
            </Stack>
          </Card>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {t("FormSubmitSuccess")}
          </Alert>
        )}

        <Stack spacing={2} sx={{ mt: 2 }}>
          <Controller
            name="nameSurname"
            control={control}
            rules={{
              required: t("Required") || "Required",
              minLength: {
                value: 2,
                message: t("MinLength2") || "Minimum 2 characters required",
              },
              maxLength: {
                value: 100,
                message: t("MaxLength100") || "Maximum 100 characters allowed",
              },
            }}
            render={({ field }) => (
              <TextField
                {...field}
                label={`${t("NameSurname")} *`}
                fullWidth
                disabled={loading}
                variant="outlined"
                error={!!errors.nameSurname}
                helperText={errors.nameSurname?.message}
                inputProps={{ maxLength: 100 }}
              />
            )}
          />

          <Controller
            name="email"
            control={control}
            rules={{
              required: t("Required") || "Required",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: t("InvalidEmail") || "Invalid email format",
              },
              maxLength: {
                value: 254,
                message: t("MaxLength254") || "Maximum 254 characters allowed",
              },
            }}
            render={({ field }) => (
              <TextField
                {...field}
                label={`${t("Email")} *`}
                type="email"
                fullWidth
                disabled={loading}
                variant="outlined"
                error={!!errors.email}
                helperText={errors.email?.message}
                inputProps={{ maxLength: 254 }}
              />
            )}
          />

          <TelInput
            name="phoneNumber"
            control={control}
            label={`${t("PhoneNumber")} *`}
            fullWidth
            disabled={loading}
            variant="outlined"
            registerOptions={true}
            error={!!errors.phoneNumber}
            errorMessage={errors.phoneNumber?.message}
            setValue={setValue}
            t={t}
          />

          <Controller
            name="message"
            control={control}
            rules={{
              required: t("Required") || "Required",
              minLength: {
                value: 2,
                message: t("MinLength2") || "Minimum 2 characters required",
              },
              maxLength: {
                value: 500,
                message: t("MaxLength500") || "Maximum 500 characters allowed",
              },
            }}
            render={({ field }) => (
              <TextField
                {...field}
                label={t("Message")}
                multiline
                rows={4}
                fullWidth
                disabled={loading}
                variant="outlined"
                placeholder={t("RequestDetailsPlaceholder")}
                error={!!errors.message}
                helperText={errors.message?.message}
                inputProps={{ maxLength: 500 }}
              />
            )}
          />

          <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
            <Turnstile
              siteKey={
                process.env.NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY || ""
              }
              onSuccess={(token) => setValue("captchaToken", token)}
              onError={() => setValue("captchaToken", "")}
              onExpire={() => setValue("captchaToken", "")}
            />
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 3, gap: 1 }}>
        <Button onClick={onClose} disabled={loading} sx={{ minWidth: "100px" }}>
          {t("Cancel")}
        </Button>
        <Button
          onClick={handleSubmit(onSubmitForm)}
          variant="contained"
          disabled={loading || success}
          sx={{
            minWidth: "120px",
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          {loading ? (
            <CircularProgress size={20} color="inherit" />
          ) : (
            <>
              <RealEstateAgentIcon />
              {t("Send")}
            </>
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ContactFormDialog;
