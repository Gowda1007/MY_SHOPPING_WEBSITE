import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";


gsap.registerPlugin(ScrollToPlugin);

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    gsap.to(window, {
      scrollTo: { y: 0, autoKill: false }, 
      duration: 0.8,
      ease: "power2.out",
    });
  }, [pathname]);

  return null;
};

export default ScrollToTop;
