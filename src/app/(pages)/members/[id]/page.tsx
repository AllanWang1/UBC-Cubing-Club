import React from "react";
import { useState, useEffect } from "react"

const Member = ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = React.use(params);
  
  
  return (
    <div className="Member">
      <div className="Header">
        <h2>Allan Wang</h2>
      </div>
    </div>
  );
};

export default Member;
