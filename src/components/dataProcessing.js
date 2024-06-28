let nodes = [];
let links = [];
let nodeIds = new Set();
let linkIds = new Set();
const ip = '192.168.9.'
const ipList = [ip + '3', ip + '105', ip + '106', ip + '22'];
const router = ip + '169';
const server = ip + '91';
let lastState = {};

export const dataParser = async (data) => {
    try {
        nodes = [];
        links = [];
        nodeIds = new Set();
        linkIds = new Set();

        await scannerParser(data.deviceData)
        for (const d of data.packetData) {
            let deviceNodeSrc = {
                id: d.src_ip,
                type: router.includes(d.src_ip) ? "router" : (server.includes(d.src_ip) ? "server" : (ipList.includes(d.src_ip) ? "non_detection" : "unauthorized_device"))
            };
            let deviceNodeDst = {
                id: d.dst_ip,
                type: router.includes(d.dst_ip) ? "router" : (server.includes(d.dst_ip) ? "server" : (ipList.includes(d.dst_ip) ? "non_detection" : "unauthorized_device"))
            };


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
                type: "port"
            };
            let portNodeDst = {
                id: `${d.dst_ip}:${d.dst_port}`,
                type: "port"
            };

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
                type: "port",
                value: 3
            };
            let portLinkDst = {
                source: d.dst_ip,
                target: portNodeDst.id,
                type: "port",
                value: 3
            };

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
                value: 1
            };
            let netLinkId = `${netLink.source}-${netLink.target}`;
            if (!linkIds.has(netLinkId)) {
                links.push(netLink);
                linkIds.add(netLinkId);
            }
        }

        await updateNodeTypesWithStateData(data.stateData);
        
        //console.log(nodes, links)
        return {
            nodes: nodes,
            links: links,
        };
    } catch (error) {
        console.error(error);
        return null;
    }
};


export const scannerParser = async (data) => {
    try {
        for (const d of data) {

            const deviceNode = {
                id: d.ip,
                mac: d.mac,
                type: router.includes(d.ip) ? "router" : (server.includes(d.ip) ? "server" : (ipList.includes(d.ip) ? "non_detection" : "unauthorized_device")),
                hostname: d.hostname,
            };

            if (!nodeIds.has(deviceNode.id)) {
                nodes.push(deviceNode);
                nodeIds.add(deviceNode.id);
            }

        };
    } catch (error) {
        console.error(error);
        return null;
    }
};

const updateNodeTypesWithStateData = (stateData) => {
    for (const states of stateData) {
        const { IP, state } = states;
        lastState[IP] = state;  // 업데이트된 상태를 저장
    }
    for (const [IP, state] of Object.entries(lastState)) {  // lastState의 각 항목을 순회
        let node = nodes.find(n => n.id === IP);
        if (node) {
            switch (state) {
                case 0:
                    node.type = 'attack_device';
                    break;
                case 1:
                    node.type = 'benign_device';
                    break;
                case 2:
                    node.type = 'reflect_device';
                    break;
                case 3:
                    node.type = 'victim_device';
                    break;
                default:
                    break;
            }
        }
    }
};

export const nodeInformation = async (d) => {
    try {
        let data;
        if (d.type === "benign_device" || d.type === "attack_device" || d.type === "reflect_device" || d.type === "victim_device" || d.type === "non_detection") {
            const parts = d.id.split(".");
            data = {"STATUS": d.type,
                "IP": d.id,
                    "MAC":d.mac,
                    "HOSTNAME":d.hostname,
                    "GRFANA": "http://localhost:3000/d/rYdddlPWk" + parts[3] + "/iot" + parts[3] + "?orgId=1&from=now-15m&to=now&refresh=5s"
                    }
        } 
        else if (d.type === "unauthorized_device") {
            data = {"STATUS": d.type,
                "IP": d.id,
                    "MAC":d.mac,
                    "HOSTNAME":d.hostname
                    }
        }
        else if (d.type === "port") {
            const parts = d.id.split(":")
            data = {"TYPE": d.type,
                    "IP": parts[0],
                    "PORT" : parts[1]};
        }
        else if (d.type === "router") {
            data = {"TYPE": d.type,
                    "IP": d.id, 
                    "MAC":d.mac}
        } 
        else if (d.type === "server") {
            data = {"TYPE": d.type,
                    "IP": d.id, 
                    "MAC":d.mac,
                    "HOSTNAME":d.hostname}
        }
        return data
    } catch (error) {
        console.error(error);
        return null;
    }
};