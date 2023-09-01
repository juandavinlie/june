import { createTheme } from "@mui/material"

// mui theme settings
declare module "@mui/material/styles" {
  interface TypographyVariants {
    title: React.CSSProperties
    tabtitle: React.CSSProperties
    error: React.CSSProperties
    button: React.CSSProperties
  }

  // allow configuration using `createTheme`
  interface TypographyVariantsOptions {
    title?: React.CSSProperties
    tabtitle?: React.CSSProperties
    error?: React.CSSProperties
    button?: React.CSSProperties
  }
}

// Update the Typography's variant prop options
declare module "@mui/material/Typography" {
  interface TypographyPropsVariantOverrides {
    title: true
    tabtitle: true
    error: true
    button: true
  }
}

export const themeSettings = createTheme({
  typography: {
    fontFamily: ["Inter", "sans-serif"].join(","),
    fontSize: 14,
    h1: {
      fontFamily: ["Inter", "sans-serif"].join(","),
      fontSize: 40,
    },
    h2: {
      fontFamily: ["Inter", "sans-serif"].join(","),
      fontWeight: "bold",
      fontSize: 28,
    },
    h3: {
      fontFamily: ["Inter", "sans-serif"].join(","),
      fontSize: 24,
    },
    h4: {
      fontFamily: ["Inter", "sans-serif"].join(","),
      fontSize: 20,
    },
    h5: {
      fontFamily: ["Inter", "sans-serif"].join(","),
      fontWeight: "300",
      fontSize: 14,
    },
    h6: {
      fontFamily: ["Inter", "sans-serif"].join(","),
      fontWeight: "300",
      color: "gray",
      fontSize: 14,
    },
    title: {
      fontFamily: ["Inter", "sans-serif"].join(","),
      fontWeight: "500",
      fontSize: 14,
    },
    tabtitle: {
      fontFamily: ["Inter", "sans-serif"].join(","),
      fontWeight: "500",
      fontSize: 18,
    },
    error: {
      fontFamily: ["Inter", "sans-serif"].join(","),
      fontWeight: "300",
      color: "#d2302f",
      fontSize: 14,
    },
    button: {
      fontFamily: ["Inter", "sans-serif"].join(","),
      fontWeight: "300",
      fontSize: 12,
      textTransform: "none"
    },
  },
  palette: {
    primary: {
      dark: "#0E062D",
      main: "#f8f9fa",
    },
    secondary: {
      main: "#000000",
    },
    background: {
      default: "#f6f7f9",
    },
  },
})
