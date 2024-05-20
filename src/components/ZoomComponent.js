import React, { useEffect } from 'react';
import * as d3 from 'd3';

const ZoomComponent = ({ gRef, svgRef }) => {
    
    const zoom = d3.zoom()
        .scaleExtent([0.01, 10])
        .on("zoom", function (event) {
            gRef.current.attr("transform", event.transform);
        });
    useEffect(() => {

    d3.select(svgRef.current).call(zoom);
    },[]);

};

export default ZoomComponent;
