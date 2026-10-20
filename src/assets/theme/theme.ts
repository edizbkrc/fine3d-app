import { Lato } from "next/font/google";
import { createTheme, alpha } from "@mui/material/styles";

export const customFont = Lato({
  weight: ["100", "300", "400", "700", "900"],
  subsets: ["latin"],
  display: "swap",
});

export const getDefaultTheme = (mode: "dark" | "light") =>
  createTheme({
    palette:
      mode === "light"
        ? {

            mode: "light",
            primary: {
              main: "#2F3D5E",
              contrastText: "#FFFFFF",
            },
            secondary: {
              main: "#B2D0C9",
              light: "#C4DDD7",
              dark: "#8FB8AE",
              contrastText: "#1F2A3E",
            },
            polygon: {
              main: "#2F3D5E",
              contrastText: "#fff",
            },
            polygonNeutral: {
              main: "#2F3D5E",
              contrastText: "#fff",
            },
            background: {
              default: "#FCFBFA",
              paper: "#FFFFFF",
            },
            text: {
              primary: "rgba(0, 0, 0, 0.87)",
              secondary: "rgba(0, 0, 0, 0.6)",
              disabled: "rgba(0, 0, 0, 0.38)",
            },
            divider: "rgba(0, 0, 0, 0.12)",
            error: {
              main: "#C81700",
              light: "#E53935",
              dark: "#8B0F00",
              contrastText: "#fff",
            },
            warning: {
              main: "#F57C00",
              light: "#FFB74D",
              dark: "#E65100",
              contrastText: "#fff",
            },
            info: {
              main: "#0288D1",
              light: "#29B6F6",
              dark: "#01579B",
              contrastText: "#fff",
            },
            success: {
              main: "#2E7D32",
              light: "#4CAF50",
              dark: "#1B5E20",
              contrastText: "#fff",
            },
            card: {
              main: "#FFFFFF",
              contrastText: "#000",
            },
            card2: {
              main: "#F5F5F7",
              contrastText: "#000",
            },
            action: {
              active: "rgba(0, 0, 0, 0.54)",
              hover: "rgba(0, 0, 0, 0.04)",
              selected: "rgba(0, 0, 0, 0.08)",
              disabled: "rgba(0, 0, 0, 0.26)",
              disabledBackground: "rgba(0, 0, 0, 0.12)",
            },
          }
        : {

            mode: "dark",
            primary: {
              main: "#4A90E2",
              light: "#6DA8E8",
              dark: "#3A7BC8",
              contrastText: "#FFFFFF",
            },
            secondary: {
              main: "#B2D0C9",
              light: "#C4DDD7",
              dark: "#8FB8AE",
              contrastText: "#1F2A3E",
            },
            polygon: {
              main: "#4A90E2",
              contrastText: "#fff",
            },
            polygonNeutral: {
              main: "#4A90E2",
              contrastText: "#fff",
            },
            background: {
              default: "#121212",
              paper: "#1E1E1E",
            },
            text: {
              primary: "rgba(255, 255, 255, 0.95)",
              secondary: "rgba(255, 255, 255, 0.7)",
              disabled: "rgba(255, 255, 255, 0.5)",
            },
            divider: "rgba(255, 255, 255, 0.12)",
            error: {
              main: "#FF6B6B",
              light: "#FF8787",
              dark: "#FA5252",
              contrastText: "#000",
            },
            warning: {
              main: "#FFA94D",
              light: "#FFC078",
              dark: "#FF922B",
              contrastText: "#000",
            },
            info: {
              main: "#4DABF7",
              light: "#74C0FC",
              dark: "#339AF0",
              contrastText: "#000",
            },
            success: {
              main: "#51CF66",
              light: "#69DB7C",
              dark: "#40C057",
              contrastText: "#000",
            },
            card: {
              main: "#1E1E1E",
              contrastText: "#fff",
            },
            card2: {
              main: "#2A2A2A",
              contrastText: "#fff",
            },
            action: {
              active: "rgba(255, 255, 255, 0.7)",
              hover: "rgba(255, 255, 255, 0.08)",
              selected: "rgba(255, 255, 255, 0.16)",
              disabled: "rgba(255, 255, 255, 0.3)",
              disabledBackground: "rgba(255, 255, 255, 0.12)",
            },
          },

    typography: {
      fontFamily: customFont.style.fontFamily,
      h1: {
        fontSize: "2.5rem",
        fontWeight: 700,
        lineHeight: 1.2,
      },
      h2: {
        fontSize: "2rem",
        fontWeight: 700,
        lineHeight: 1.3,
      },
      h3: {
        fontSize: "1.75rem",
        fontWeight: 600,
        lineHeight: 1.4,
      },
      h4: {
        fontSize: "1.5rem",
        fontWeight: 600,
        lineHeight: 1.4,
      },
      h5: {
        fontSize: "1.25rem",
        fontWeight: 600,
        lineHeight: 1.5,
      },
      h6: {
        fontSize: "1rem",
        fontWeight: 600,
        lineHeight: 1.5,
      },
      body1: {
        fontSize: "1rem",
        lineHeight: 1.5,
      },
      body2: {
        fontSize: "0.875rem",
        lineHeight: 1.5,
      },
    },

    shape: {
      borderRadius: 8,
    },

    shadows:
      mode === "light"
        ? [
            "none",
            "0px 2px 4px rgba(0, 0, 0, 0.05)",
            "0px 4px 8px rgba(0, 0, 0, 0.08)",
            "0px 8px 16px rgba(0, 0, 0, 0.1)",
            "0px 12px 24px rgba(0, 0, 0, 0.12)",
            "0px 16px 32px rgba(0, 0, 0, 0.14)",
            "0px 20px 40px rgba(0, 0, 0, 0.16)",
            "0px 24px 48px rgba(0, 0, 0, 0.18)",
            "0px 28px 56px rgba(0, 0, 0, 0.2)",
            "0px 32px 64px rgba(0, 0, 0, 0.22)",
            "0px 36px 72px rgba(0, 0, 0, 0.24)",
            "0px 40px 80px rgba(0, 0, 0, 0.26)",
            "0px 44px 88px rgba(0, 0, 0, 0.28)",
            "0px 48px 96px rgba(0, 0, 0, 0.3)",
            "0px 52px 104px rgba(0, 0, 0, 0.32)",
            "0px 56px 112px rgba(0, 0, 0, 0.34)",
            "0px 60px 120px rgba(0, 0, 0, 0.36)",
            "0px 64px 128px rgba(0, 0, 0, 0.38)",
            "0px 68px 136px rgba(0, 0, 0, 0.4)",
            "0px 72px 144px rgba(0, 0, 0, 0.42)",
            "0px 76px 152px rgba(0, 0, 0, 0.44)",
            "0px 80px 160px rgba(0, 0, 0, 0.46)",
            "0px 84px 168px rgba(0, 0, 0, 0.48)",
            "0px 88px 176px rgba(0, 0, 0, 0.5)",
            "0px 92px 184px rgba(0, 0, 0, 0.52)",
          ]
        : [
            "none",
            "0px 2px 4px rgba(0, 0, 0, 0.2)",
            "0px 4px 8px rgba(0, 0, 0, 0.24)",
            "0px 8px 16px rgba(0, 0, 0, 0.28)",
            "0px 12px 24px rgba(0, 0, 0, 0.32)",
            "0px 16px 32px rgba(0, 0, 0, 0.36)",
            "0px 20px 40px rgba(0, 0, 0, 0.4)",
            "0px 24px 48px rgba(0, 0, 0, 0.44)",
            "0px 28px 56px rgba(0, 0, 0, 0.48)",
            "0px 32px 64px rgba(0, 0, 0, 0.52)",
            "0px 36px 72px rgba(0, 0, 0, 0.56)",
            "0px 40px 80px rgba(0, 0, 0, 0.6)",
            "0px 44px 88px rgba(0, 0, 0, 0.64)",
            "0px 48px 96px rgba(0, 0, 0, 0.68)",
            "0px 52px 104px rgba(0, 0, 0, 0.72)",
            "0px 56px 112px rgba(0, 0, 0, 0.76)",
            "0px 60px 120px rgba(0, 0, 0, 0.8)",
            "0px 64px 128px rgba(0, 0, 0, 0.84)",
            "0px 68px 136px rgba(0, 0, 0, 0.88)",
            "0px 72px 144px rgba(0, 0, 0, 0.92)",
            "0px 76px 152px rgba(0, 0, 0, 0.96)",
            "0px 80px 160px rgba(0, 0, 0, 1)",
            "0px 84px 168px rgba(0, 0, 0, 1)",
            "0px 88px 176px rgba(0, 0, 0, 1)",
            "0px 92px 184px rgba(0, 0, 0, 1)",
          ],

    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            scrollbarColor:
              mode === "dark"
                ? "rgba(255, 255, 255, 0.3) #060D12"
                : "#2F3D5E #FCFBFA",
            "&::-webkit-scrollbar, & *::-webkit-scrollbar": {
              width: 8,
              height: 8,
            },
            "&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb": {
              borderRadius: 8,
              backgroundColor:
                mode === "dark" ? "rgba(255, 255, 255, 0.3)" : "#2F3D5E",
              minHeight: 24,
            },
            "&::-webkit-scrollbar-thumb:hover, & *::-webkit-scrollbar-thumb:hover":
              {
                backgroundColor:
                  mode === "dark" ? "rgba(255, 255, 255, 0.5)" : "#1F2A3E",
              },
            "&::-webkit-scrollbar-track, & *::-webkit-scrollbar-track": {
              backgroundColor: mode === "dark" ? "#060D12" : "#FCFBFA",
            },
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: "none",
            fontWeight: 600,
            borderRadius: 8,
          },
          contained: {
            boxShadow:
              mode === "dark"
                ? "0 2px 8px rgba(0, 0, 0, 0.4)"
                : "0 2px 8px rgba(0, 0, 0, 0.1)",
            "&:hover": {
              boxShadow:
                mode === "dark"
                  ? "0 4px 12px rgba(0, 0, 0, 0.6)"
                  : "0 4px 12px rgba(0, 0, 0, 0.15)",
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            backgroundImage: "none",
            boxShadow:
              mode === "dark"
                ? "0 4px 16px rgba(0, 0, 0, 0.3)"
                : "0 2px 8px rgba(0, 0, 0, 0.08)",
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
          },
          elevation1: {
            boxShadow:
              mode === "dark"
                ? "0 2px 8px rgba(0, 0, 0, 0.3)"
                : "0 2px 4px rgba(0, 0, 0, 0.05)",
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundImage: "none",
            borderRight:
              mode === "dark"
                ? "1px solid rgba(255, 255, 255, 0.12)"
                : "1px solid rgba(0, 0, 0, 0.12)",
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            "& .MuiOutlinedInput-root": {
              "&:hover fieldset": {
                borderColor: mode === "dark" ? "#5C7CFA" : "#2F3D5E",
              },
            },
          },
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            backgroundColor: mode === "dark" ? "#1A2027" : "#2F3D5E",
            fontSize: "0.875rem",
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 6,
          },
        },
      },
    },
  });

declare module "@mui/material/styles" {
  interface Palette {
    card: Palette["primary"];
    card2: Palette["primary"];
    polygon: Palette["primary"];
    polygonNeutral: Palette["primary"];
  }

  interface PaletteOptions {
    card?: PaletteOptions["primary"];
    card2?: PaletteOptions["primary"];
    polygon?: PaletteOptions["primary"];
    polygonNeutral?: PaletteOptions["primary"];
  }
}
