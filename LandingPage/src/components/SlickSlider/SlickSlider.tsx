import React from "react";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider, { Settings } from "react-slick";

interface SlickSliderProps {
  settings: Settings;
  children: React.ReactNode;
}

const SlickSlider: React.FC<SlickSliderProps> = (props) => {
  return <Slider {...props.settings}>{props.children}</Slider>;
};

export default SlickSlider;
