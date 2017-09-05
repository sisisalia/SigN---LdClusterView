// function to locate the leaf nodes
function findLeafNodes(node) {
    // found leaf node
    if (node.nodes.length == 1) {
        return [node];
    } else {
        nodes = $.map(node.nodes, function(v, i) {
            return findLeafNodes(v)
        });
        return nodes;
    }
}

// hierarchical clustering algorithm, implements complete linkage for now
function hclust(dist) {
    // get a list of all the entities first
    var cluster = [];
    for (i in dist) {
        if ($.inArray(i, cluster) < 0) {
            cluster.push(i);
        }
        for (j in dist[i]) {
            if ($.inArray(j, cluster) < 0) {
                cluster.push(j);
            }
        }
    }
    // initialize the cluster by creating a flat list of nodes
    cluster = $.map(cluster, function(v, i) {
        return {
            nodes: [v],
            distance: 0.0
        }
    });

    // find the closest max distance
    function completeLinkage(dist, a, b) {
        var anodes = findLeafNodes(a);
        var bnodes = findLeafNodes(b);
        var best_dist = null;
        var d = null;
        for (var i = 0; i < anodes.length; i++) {
            for (var j = 0; j < bnodes.length; j++) {
                if (dist.hasOwnProperty(anodes[i].nodes[0]) && dist[anodes[i].nodes[0]].hasOwnProperty(bnodes[j].nodes[0])) {
                    d = dist[anodes[i].nodes[0]][bnodes[j].nodes[0]];
                } else if (dist.hasOwnProperty(bnodes[j].nodes[0]) && dist[bnodes[j].nodes[0]].hasOwnProperty(anodes[i].nodes[0])) {
                    d = dist[bnodes[j].nodes[0]][anodes[i].nodes[0]];
                } else {
                    throw "Unable to locate distance";
                }
                if (best_dist == null || d > best_dist) {
                    best_dist = d;
                }
            }
        }
        return best_dist;
    }
    // find the closest average distance
    function averageLinkage(dist, a, b) {
        var anodes = findLeafNodes(a);
        var bnodes = findLeafNodes(b);
        var sum = 0;
        var n = 0;
        for (var i = 0; i < anodes.length; i++) {
            for (var j = 0; j < bnodes.length; j++) {
                if (dist.hasOwnProperty(anodes[i].nodes[0]) && dist[anodes[i].nodes[0]].hasOwnProperty(bnodes[j].nodes[0])) {
                    d = dist[anodes[i].nodes[0]][bnodes[j].nodes[0]];
                } else if (dist.hasOwnProperty(bnodes[j].nodes[0]) && dist[bnodes[j].nodes[0]].hasOwnProperty(anodes[i].nodes[0])) {
                    d = dist[bnodes[j].nodes[0]][anodes[i].nodes[0]];
                } else {
                    throw "Unable to locate distance";
                }
                sum += d;
                n += 1;
            }
        }
        return (sum / n);
    }
    // function to find the best pair of nodes
    function findBestPair(dist, cluster, linkage = "complete") {
        var best = null;
        var d = null;
        for (var i = 0; i < (cluster.length - 1); i++) {
            for (var j = i + 1; j < cluster.length; j++) {
                if (linkage == "complete") {
                    d = completeLinkage(dist, cluster[i], cluster[j]);
                } else if (linkage == "average") {
                    d = averageLinkage(dist, cluster[i], cluster[j]);
                }
                if (best == null || d < best[0]) {
                    best = [d, i, j];
                }
            }
        }
        return best;
    }

    // iterate till one node remains
    var best = null;
    // computeDistance(dist, cluster);
    while (cluster.length > 1) {
        best = findBestPair(dist, cluster);
        cluster = cluster.concat({
            nodes: [cluster[best[1]], cluster[best[2]]],
            distance: best[0]
        });
        cluster.splice(best[2], 1);
        cluster.splice(best[1], 1);
    }
    cluster = cluster[0];
    return cluster;
}

// collapse the cluster by a distance, nodes which are less than distance are combined together, need to rewrite to create new nodes instead of using old nodes
function collapseByDistance(node, distance, level) {
    level = level == undefined ? 1 : level;
    // if the node distance is less than the threshold, then collapse
    if (node.distance <= distance) {
        return {
            level: level,
            distance: distance,
            nodes: [{
                snps: $.map(findLeafNodes(node), function(v, i) {
                    return v.nodes[0]
                })
            }],
            parent: null
        }
    } else {
        var n = {
            level: level,
            distance: node.distance,
            nodes: [],
            parent: null
        };
        for (var i = 0; i < node.nodes.length; i++) {
            n1 = collapseByDistance(node.nodes[i], distance, level + 1);
            n1.parent = n;
            n.nodes.push(n1);
        }
        return n;
    }
}

// function to find a node by the SNP
function findDendrogramNodeBySnp(node, snp) {
    if (node.nodes.length == 1 && node.nodes[0].snps.indexOf(snp) != -1) {
        return node;
    } else if (node.nodes.length > 1) {
        var n = null;
        for (var i = 0; i < node.nodes.length; i++) {
            n = findDendrogramNodeBySnp(node.nodes[i], snp);
            if (n != null) {
                break;
            }
        }
        return n;
    } else {
        return null;
    }
}

// funtion to bubble the SNP to the top of the dendrogram
function bubbleDendrogramNodeToTop(node) {
    if (node.parent != null) {
        // get the index position of the node
        var i = node.parent.nodes.indexOf(node);
        // swap the position if required
        if (i != 0) {
            var n = node.parent.nodes[0];
            node.parent.nodes[0] = node;
            node.parent.nodes[i] = n;
        }
        // make the parent do the same
        bubbleDendrogramNodeToTop(node.parent);
    }
}

// compute the dendrogram specifying the distance cutoff
function computeDendrogram(data, distance_cutoff) {
    // collapse the cluster by distance
    data.dendrogram = collapseByDistance(snp_hc, distance_cutoff);
    // fix to the reference SNP if there is one
    if (data.refSnp != null) {
        var n = findDendrogramNodeBySnp(data.dendrogram, data.refSnp);
        bubbleDendrogramNodeToTop(n);
    }
    // compute the leaf nodes
    data.leaf_nodes = findLeafNodes(data.dendrogram);
    if(data.refSnp == null)
        data.refSnp = data.leaf_nodes[0].nodes[0].snps[0];
    $.map(data.leaf_nodes, function(node, i) {
        node.ypos = i / (data.leaf_nodes.length - 1);
        node.xpos = 0
    });
    // compute the positions of nodes
    function computePosition(node) {
        // leaf node
        if (node.nodes.length > 1) {
            node.xpos = node.distance;
            // compute the positions of the child nodes
            $.map(node.nodes, function(n, i) {
                computePosition(n)
            });
            var ypositions = $.map(node.nodes, function(n, i) {
                return n.ypos
            });
            node.ypos = (ypositions[0] + ypositions[ypositions.length - 1]) / 2;
        }
        return node;
    }
    data.dendrogram = computePosition(data.dendrogram);
    return data;
}

// compute the distances
function computeDistance(data, linkage = "complete") {
    var dist = snp_r2;
    var cluster = data.dendrogram;
    var snps = data.snps;
    allDendrogramNodes = [];
    for (var key in snps) {
        if (snps.hasOwnProperty(key)) {
            var snpsTemp = findDendrogramNodeBySnp(cluster, key);
            if (allDendrogramNodes.indexOf(snpsTemp.nodes[0].snps) < 0) {
                allDendrogramNodes.push(snpsTemp.nodes[0].snps);
            }
        }
    }
    data.allDistances = [];
    for (snp1 in allDendrogramNodes) {
        for (snp2 in allDendrogramNodes) {
            var node = {};
            var best_dist = null;
            var d = null;
            for (var i = 0; i < allDendrogramNodes[snp1].length; i++) {
                for (var j = 0; j < allDendrogramNodes[snp2].length; j++) {
                    if (dist.hasOwnProperty(allDendrogramNodes[snp1][i]) && dist[allDendrogramNodes[snp1][i]].hasOwnProperty(allDendrogramNodes[snp2][j])) {
                        d = dist[allDendrogramNodes[snp1][i]][allDendrogramNodes[snp2][j]];
                    } else if (dist.hasOwnProperty(allDendrogramNodes[snp2][j]) && dist[allDendrogramNodes[snp2][j]].hasOwnProperty(allDendrogramNodes[snp1][i])) {
                        d = dist[allDendrogramNodes[snp2][j]][allDendrogramNodes[snp1][i]];
                    } else {
                        throw "Unable to locate distance";
                    }
                    if (best_dist == null || d > best_dist) {
                        best_dist = d;
                    }
                }
            }
            node.ypos = best_dist;
            node.nodes = [];
            node.nodes.push({
                refSnp: allDendrogramNodes[snp1],
                snps: allDendrogramNodes[snp2]
            });
            data.allDistances = data.allDistances.concat(node);
        }
    }
    return data;
}
