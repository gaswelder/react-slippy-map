import React, { useState, useCallback } from "react";

const defaultCenter = { latitude: 53.9049, longitude: 27.5609 };

export default function withOwnCenter(M) {
  return (props) => {
    const [center, setCenter] = useState(defaultCenter);

    const onCenterChange = props.onCenterChange;
    const handleCenterChange = useCallback(
      (center) => {
        setCenter(center);
        if (onCenterChange) {
          onCenterChange(center);
        }
      },
      [onCenterChange]
    );
    return <M {...props} onCenterChange={handleCenterChange} center={center} />;
  };
}
