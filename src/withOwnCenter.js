import React, { useState, useCallback } from "react";

const defaultCenter = { latitude: 53.9049, longitude: 27.5609 };

export default function withOwnCenter(M) {
  return (props) => {
    const [center, setCenter] = useState(defaultCenter);

    const onAreaChange = props.onAreaChange;
    const handleCenterChange = useCallback(
      (area) => {
        setCenter(area.center);
        if (onAreaChange) {
          onAreaChange(area);
        }
      },
      [onAreaChange]
    );
    return <M {...props} onAreaChange={handleCenterChange} center={center} />;
  };
}
