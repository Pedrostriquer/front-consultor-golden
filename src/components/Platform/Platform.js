import React, { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Sidebar from "../Sidebar/Sidebar";
import LoadingScreen from "../LoadingScreen/LoadingScreen";

import "./Platform.css";

function Platform() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    setIsPageLoading(true);
    const timer = setTimeout(() => {
      setIsPageLoading(false);
    }, 1200);

    return () => clearTimeout(timer);
  }, [location.pathname]);

  const contentVariants = {
    expanded: { 
      marginLeft: "calc(280px + 2rem)", 
      transition: { duration: 0.4, ease: "easeOut" } // <-- CORRIGIDO
    },
    collapsed: { 
      marginLeft: "calc(90px + 2rem)", 
      transition: { duration: 0.4, ease: "easeOut" } // <-- CORRIGIDO
    }
  };

  return (
    <div className="platform-container">
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
      />
      
      <AnimatePresence>
        {isPageLoading && (
          <LoadingScreen
            isContentLoader={true}
            isSidebarCollapsed={isSidebarCollapsed} 
          />
        )}
      </AnimatePresence>

      <motion.div 
        className="content-wrapper"
        initial={false}
        animate={isSidebarCollapsed ? "collapsed" : "expanded"}
        variants={contentVariants}
      >
        <main className={`content ${isPageLoading ? "content--loading" : ""}`}>
          <Outlet />
        </main>
      </motion.div>
    </div>
  );
}

export default Platform;