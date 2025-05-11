import React, { ReactNode } from "react";
import FooterOne from "../components/Footer/FooterOne";
import HeaderOne from "../components/Header/HeaderOne";
import PageLoader from "../components/PageLoader/PageLoader";
import cn from "classnames";

// Define the type for props to include 'children'
interface LayoutOneProps {
  children: ReactNode;
}

const LayoutOne: React.FC<LayoutOneProps> = ({ children }) => {
  return (
    <div> {/* Removed cn("") as you don't need dynamic classes here */}
      <PageLoader />
      <HeaderOne />
      {children}  {/* Accessing children directly */}
      <FooterOne />
    </div>
  );
};

export default LayoutOne;
