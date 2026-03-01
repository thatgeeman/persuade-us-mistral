import { createContext, useContext } from "react"

export const ThemeContext = createContext({ classic: false })
export const useTheme = () => useContext(ThemeContext)
