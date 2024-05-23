export const packetparser = async (data) => {
    try {
        let nodes = []; // 노드 목록 초기화
        let links = []; // 링크 목록 초기화
        let nodeIds = new Set(); // 노드 ID 저장을 위한 Set
        let linkIds = new Set(); // 링크 ID (source-target 쌍) 저장을 위한 Set
        for (const d of data) {
            let deviceNodeSrc = {
                id: d.src_ip,
                type: d.src_ip === '192.168.6.7' ? "Router" : "Device"
            };
            let deviceNodeDst = {
                id: d.dst_ip,
                type: d.dst_ip === '192.168.6.7' ? "Router" : "Device"
            };

            // src_ip와 dst_ip에 대한 Device 노드 중복 제거 후 추가
            if (!nodeIds.has(deviceNodeSrc.id)) {
                nodes.push(deviceNodeSrc);
                nodeIds.add(deviceNodeSrc.id);
            }
            if (!nodeIds.has(deviceNodeDst.id)) {
                nodes.push(deviceNodeDst);
                nodeIds.add(deviceNodeDst.id);
            }

            let portNodeSrc = {
                id: `${d.src_ip}:${d.src_port}`,
                type: "Port"
            };
            let portNodeDst = {
                id: `${d.dst_ip}:${d.dst_port}`,
                type: "Port"
            };

            // src_port와 dst_port에 대한 Port 노드 중복 제거 후 추가
            if (!nodeIds.has(portNodeSrc.id)) {
                nodes.push(portNodeSrc);
                nodeIds.add(portNodeSrc.id);
            }
            if (!nodeIds.has(portNodeDst.id)) {
                nodes.push(portNodeDst);
                nodeIds.add(portNodeDst.id);
            }

            let portLinkSrc = {
                source: d.src_ip,
                target: portNodeSrc.id,
                type: "Port",
                value: 3,
                length: 5
            };
            let portLinkDst = {
                source: d.dst_ip,
                target: portNodeDst.id,
                type: "Port",
                value: 3,
                length: 5
            };

            // 소스와 타겟을 기준으로 한 링크 중복 제거 후 추가
            let portLinkSrcId = `${portLinkSrc.source}-${portLinkSrc.target}`;
            let portLinkDstId = `${portLinkDst.source}-${portLinkDst.target}`;
            if (!linkIds.has(portLinkSrcId)) {
                links.push(portLinkSrc);
                linkIds.add(portLinkSrcId);
            }
            if (!linkIds.has(portLinkDstId)) {
                links.push(portLinkDst);
                linkIds.add(portLinkDstId);
            }

            let netLink = {
                source: portNodeSrc.id,
                target: portNodeDst.id,
                type: d.protocol,
                value: 5,
                length: 20
            };
            let netLinkId = `${netLink.source}-${netLink.target}`;
            if (!linkIds.has(netLinkId)) {
                links.push(netLink);
                linkIds.add(netLinkId);
            }
        }
        
        console.log(nodes, links)
        return {
            nodes: nodes,
            links: links,
        };
    } catch (error) {
        console.error(error);
        return null;
    }
};


export const scannerparser = async (data, nodes, links, nodeIds, linkIds) => {
    try {
        nodes = []
        nodeIds = new Set();

        for (const d of data) {

            let deviceNode = {
                id: d.ip,
                mac: d.mac,
                type: d.ip === '192.168.216.7' ? "Router" : "Device",
                hostname: d.hostname,
            };

            if (!nodeIds.has(deviceNode.id)) {
                nodes.push(deviceNode);
                nodeIds.add(deviceNode.id);
            }

        }
        return {
            nodes: nodes,
            links: links,
            nodeIds: nodeIds,
            linkIds: linkIds
        };
    } catch (error) {
        console.error(error);
        return null;
    }
};


export const nodeInformation = async (d) => {
    try {
        let data;
        if (d.type === "Device") {
            data = {"Device": d.id }
        } 
        else if (d.type === "Port") {
            const parts = d.id.split(":")
            data = {"Device": parts[0],
                    "Port" : parts[1]};
        }
        else if (d.type === "Router") {
            data = {"Router": d.id }
        } 
        return data
    } catch (error) {
        console.error(error);
        return null;
    }
};