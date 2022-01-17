import React from "react";
import AppHeader from "./AppHeader";

/**
 * Main Layout component which wrapps around the whole app
 * @param param0
 * @returns
 */
export const MainLayout: React.FC = ({ children }) => {
  return (
    
      <>
        <AppHeader />
        <main>{children}</main>
      </>
  );
};
