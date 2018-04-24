// function to locate the leaf nodes
function findLeafNodes(node) {
    // found leaf node
    if (node.nodes.length == 1) {
        return [node];
    } else {
        var nodes = $.map(node.nodes, function(v, i) {
            return this.findLeafNodes(v)
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
        var anodes = this.findLeafNodes(a);
        var bnodes = this.findLeafNodes(b);
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
        var anodes = this.findLeafNodes(a);
        var bnodes = this.findLeafNodes(b);
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
            n = this.findDendrogramNodeBySnp(node.nodes[i], snp);
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
    if (node) {
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
            this.bubbleDendrogramNodeToTop(node.parent);
        }
    }
}

// compute the dendrogram specifying the distance cutoff
function computeDendrogram(distance_cutoff) {
    // collapse the cluster by distance
    this.dendrogram = this.collapseByDistance(this.snp_hc, distance_cutoff);
    // fix to the reference SNP if there is one
    if (this.refSnp != null) {
        var n = this.findDendrogramNodeBySnp(this.dendrogram, this.refSnp);
        this.bubbleDendrogramNodeToTop(n);
    }
    // compute the leaf nodes
    this.leaf_nodes = this.findLeafNodes(this.dendrogram);
    if(this.refSnp == null)
        this.refSnp = this.leaf_nodes[0].nodes[0].snps[0];
    var leaf_nodes = this.leaf_nodes;
    $.map(this.leaf_nodes, function(node, i) {
        node.ypos = i / (leaf_nodes.length - 1);
        node.ypos = i / (leaf_nodes.length - 1);
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
    this.dendrogram = computePosition(this.dendrogram);
    return this.dendrogram;
}

// compute the distances
function computeDistance(linkage = "complete") {
    var dist = this.snp_r2;
    var cluster = this.dendrogram;
    var allDendrogramNodes = [];
    for (var key in this.snps) {
        if (this.snps.hasOwnProperty(key)) {
            var snpsTemp = this.findDendrogramNodeBySnp(cluster, key);
            if (allDendrogramNodes.indexOf(snpsTemp.nodes[0].snps) < 0) {
                allDendrogramNodes.push(snpsTemp.nodes[0].snps);
            }
        }
    }
    this.allDistances = [];
    for (var snp1 in allDendrogramNodes) {
        for (var snp2 in allDendrogramNodes) {
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
            this.allDistances = this.allDistances.concat(node);
        }
    }
    return this.allDistances;
}
