import { OrderProps, totalOrdersDone, totalOrders } from "@/app/models/order";
import React, { useRef, useEffect, useState } from "react";

export const ProgressBar = ({ order }: OrderProps) => {
  const progressBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (progressBarRef.current) {
      const totalWidth = progressBarRef.current.offsetWidth;
      const width = (totalWidth * totalOrdersDone(order)) / totalOrders(order);
      progressBarRef.current.style.width = `${width}px`;
    }
  }, [order]);

  return (
    <div className="w-full h-2 rounded-lg bg-surface-75">
      <div ref={progressBarRef} className="h-2 rounded-lg bg-primary-500"></div>
    </div>
  );
};
