(function (vindig, jQuery, L, undefined) {
    L.mapbox.accessToken =
        "pk.eyJ1IjoiaW5mb2FtYXpvbmlhIiwiYSI6InItajRmMGsifQ.JnRnLDiUXSEpgn7bPDzp7g";

    module.exports = function (app) {
        app.directive("tourFocus", [
            function () {
                return {
                    restrict: "A",
                    scope: {
                        sel: "=tourFocus",
                        direction: "=",
                        active: "=",
                    },
                    link: function (scope, element, attrs) {
                        var width, height, offset;

                        var focus = jQuery(scope.sel);

                        var el = jQuery(element);
                        var desc = el.find(".step-description");
                        var arrow = el.find(".arrow");

                        el.addClass(scope.direction);

                        var set = function () {
                            width = focus.innerWidth();
                            height = focus.innerHeight();
                            offset = focus.offset();
                            el.css({
                                width: width,
                                height: height,
                                top: offset.top,
                                left: offset.left,
                            });
                            if (scope.direction == "right") {
                                desc.css({
                                    top: offset.top - 10,
                                    left: offset.left,
                                    "margin-left": -320,
                                });
                                arrow.css({
                                    top: offset.top,
                                    left: offset.left,
                                    "margin-top": 10,
                                    "margin-left": -40,
                                });
                            } else if (scope.direction == "left") {
                                desc.css({
                                    top: offset.top - 10,
                                    left: width,
                                    "margin-left": 30,
                                });
                                arrow.css({
                                    top: offset.top,
                                    left: width,
                                    "margin-top": 10,
                                    "margin-left": 20,
                                });
                            } else if (scope.direction == "top") {
                                desc.css({
                                    bottom:
                                        jQuery(window).height() -
                                        offset.top +
                                        30,
                                    left: parseLeft(
                                        offset.left + width / 2 - 290 / 2
                                    ),
                                });
                                arrow.css({
                                    bottom:
                                        jQuery(window).height() - offset.top,
                                    left: offset.left + width / 2,
                                    "margin-bottom": 20,
                                    "margin-left": -10,
                                });
                            } else if (scope.direction == "bottom") {
                                desc.css({
                                    top: offset.top + height,
                                    left: parseLeft(
                                        offset.left + width / 2 - 290 / 2
                                    ),
                                    "margin-top": 30,
                                });
                                arrow.css({
                                    top: offset.top + height,
                                    left: offset.left + width / 2,
                                    "margin-top": 20,
                                    "margin-left": -10,
                                });
                            }
                        };
                        function parseLeft(number) {
                            max = jQuery(window).width() - desc.innerWidth();
                            if (number < 0) return 0;
                            else if (number > max) return max;
                            else return number;
                        }
                        set();
                        scope.$watch(
                            "active",
                            _.debounce(function () {
                                set();
                            }, 400)
                        );
                        jQuery(window).resize(set);
                    },
                };
            },
        ]);

        app.directive("scrollUp", [
            function () {
                return {
                    restrict: "A",
                    scope: {
                        scrollUp: "=",
                    },
                    link: function (scope, element, attrs) {
                        var el = jQuery(scope.scrollUp);
                        jQuery(element).on("click", function () {
                            el.scrollTop(0);
                        });
                    },
                };
            },
        ]);

        app.directive("attachToContent", [
            function () {
                return {
                    restrict: "A",
                    scope: {
                        sel: "=attachToContent",
                    },
                    link: function (scope, element, attrs) {
                        var el = jQuery(scope.sel || ".single");
                        jQuery(window).resize(function () {
                            jQuery(element).css({
                                left: el.offset().left + el.width() + "px",
                            });
                        });
                        jQuery(window).resize();
                    },
                };
            },
        ]);

        app.directive("tagExternal", [
            "$timeout",
            function ($timeout) {
                return {
                    restrict: "A",
                    link: function (scope, element, attrs) {
                        function isExternal(url) {
                            var match = url.match(
                                /^([^:\/?#]+:)?(?:\/\/([^\/?#]*))?([^?#]+)?(\?[^#]*)?(#.*)?/
                            );
                            if (
                                typeof match[1] === "string" &&
                                match[1].length > 0 &&
                                match[1].toLowerCase() !== location.protocol
                            )
                                return true;
                            if (
                                typeof match[2] === "string" &&
                                match[2].length > 0 &&
                                match[2].replace(
                                    new RegExp(
                                        ":(" +
                                            { "http:": 80, "https:": 443 }[
                                                location.protocol
                                            ] +
                                            ")?$"
                                    ),
                                    ""
                                ) !== location.host
                            )
                                return true;
                            return false;
                        }
                        $timeout(function () {
                            jQuery(element)
                                .find("a")
                                .each(function () {
                                    if (
                                        !jQuery(this).parents(".share").length
                                    ) {
                                        if (
                                            isExternal(
                                                jQuery(this).attr("href")
                                            )
                                        )
                                            jQuery(this)
                                                .addClass("external")
                                                .attr({
                                                    rel: "external",
                                                    target: "_blank",
                                                });
                                    }
                                });
                        }, 200);
                    },
                };
            },
        ]);

        app.directive("forceOnclick", [
            function () {
                return {
                    restrict: "A",
                    scope: {
                        forceOnclick: "=",
                        forceParent: "@",
                    },
                    link: function (scope, element, attrs) {
                        var ms = scope.forceOnclick || 500;
                        var el;
                        if (scope.forceParent) {
                            el = jQuery("#" + scope.forceParent);
                        } else {
                            el = jQuery(element);
                        }
                        var handler = function (e) {
                            el.removeClass("force");
                            if (e.type && e.type == "mousemove") {
                                jQuery(document).unbind("mousemove", handler);
                            }
                        };
                        jQuery(element).on("click", function () {
                            el.addClass("force");
                            if (ms == "move") {
                                jQuery(document).on("mousemove", handler);
                            } else {
                                setTimeout(handler, ms);
                            }
                        });
                    },
                };
            },
        ]);

        app.directive("map", [
            "$rootScope",
            "$state",
            "Vindig",
            function ($rootScope, $state, Vindig) {
                return {
                    restrict: "E",
                    scope: {
                        mapData: "=",
                        markers: "=",
                        heatMarker: "=",
                    },
                    link: function (scope, element, attrs) {
                        function getLocStr() {
                            var center = map.getCenter();
                            var zoom = map.getZoom();
                            var loc = [];
                            loc.push(center.lat);
                            loc.push(center.lng);
                            loc.push(zoom);
                            return loc.join(",");
                        }

                        function getStateLoc() {
                            if ($state.params.loc)
                                return $state.params.loc.split(",");
                            else return [];
                        }

                        function getFiltersParams() {
                            const result = {};
                            
                            if ($state.params.uf) 
                                result['uf'] = $state.params.uf;

                            if ($state.params.povo) 
                                result['povo'] = $state.params.povo;

                            if ($state.params.text) 
                                result['text'] = $state.params.text;

                            if ($state.params.date_min) 
                                result['date_min'] = $state.params.date_min;

                            if ($state.params.date_max) 
                                result['date_max'] = $state.params.date_max;
                            
                            return result;
                        }

                        angular
                            .element(element)
                            .append('<div id="' + attrs.id + '"></div>')
                            .attr("id", "");

                        var loc = getStateLoc();

                        var center = [0, 0];
                        var zoom = 2;

                        if (loc.length) {
                            center = [loc[0], loc[1]];
                            zoom = loc[2];
                        }

                        $rootScope.$on(
                            "doneLoading",
                            function (ev, $scope) {
                                const params = getFiltersParams();

                                const filters = $scope.filter

                                if (params['uf']) 
                                    filters.strict.uf = params['uf'];


                                if (params['povo']) 
                                    filters.strict.povo = params['povo'];


                                if (params['text']) 
                                    filters.text = params['text'];

                                if (params['date_min'] || params['date_max']) 
                                    filters.date = { min: parseInt(params['date_min']), max: parseInt(params['date_max']) };

                                $rootScope.$broadcast("updatedFilters", filters);
                            },
                            true
                        );

                        var map = L.map(attrs.id, {
                            fullscreenControl: true,
                            center: center,
                            zoom: zoom,
                            maxZoom: 18,
                        });

                        map.attributionControl.setPrefix("");

                        var prevLocStr;
                        var doMove = true;
                        $rootScope.$on("$stateChangeStart", function () {
                            doMove = false;
                        });
                        $rootScope.$on("$stateChangeSuccess", function () {
                            doMove = true;
                        });
                        map.on(
                            "move",
                            _.debounce(function () {
                                scope.$emit("mapUpdated", map);
                                scope.$apply(function () {
                                    if (doMove) {
                                        var locStr = getLocStr();
                                        if (locStr != prevLocStr)
                                            $state.go(
                                                $state.current.name,
                                                { loc: getLocStr() },
                                                {
                                                    notify: false,
                                                    location: "replace",
                                                }
                                            );
                                        prevLocStr = getLocStr();
                                    }
                                });
                            }, 1000)
                        );

                        // watch map invalidation
                        $rootScope.$on("invalidateMap", function () {
                            setTimeout(function () {
                                map.invalidateSize(true);
                            }, 15);
                        });

                        // watch focus map
                        var calledFocus;
                        $rootScope.$on("focusMap", function (ev, coordinates) {
                            calledFocus = coordinates;
                            map.fitBounds(
                                L.latLngBounds([
                                    [coordinates[1], coordinates[0]],
                                ])
                            );
                        });

                        /*
                         * Map data
                         */
                        scope.mapData = false;
                        var mapInit = false;
                        scope.$watch("mapData", function (mapData, prev) {

                            if (mapData.id !== prev.id || !mapInit) {
                                mapInit = true;
                                var mapMeta = mapData.meta;
                                var bruteLayers = mapMeta.layers;
                                var layersObjects = [];

                                scope.layers = mapData.layers;
                                
                                setTimeout(function () {

                                    if (mapMeta.min_zoom)
                                        map.options.minZoom = parseInt(
                                            mapMeta.min_zoom
                                        );
                                    else map.options.minZoom = 1;

                                    if (mapMeta.max_zoom)
                                        map.options.maxZoom = parseInt(
                                            mapMeta.max_zoom
                                        );
                                    else map.options.maxZoom = 18;
                                    
                                    // if (!loc.length && mapData.id !== prev.id) {
                                    if (!loc.length) {
                                        setTimeout(function () {
                                            map.setView(
                                                { lat: mapMeta.center_lat, lon: mapMeta.center_lon },
                                                mapMeta.initial_zoom,
                                                {
                                                    reset: true,
                                                }
                                            );
                                            map.setZoom(mapMeta.initial_zoom);
                                            setTimeout(function () {
                                                map.setView(
                                                    { lat: mapMeta.center_lat, lon: mapMeta.center_lon },
                                                    mapMeta.initial_zoom ,
                                                    {
                                                        reset: true,
                                                    }
                                                );
                                                map.setZoom(mapMeta.initial_zoom);
                                            }, 100);
                                        }, 200);
                                    }

                                    setTimeout(function () {
                                        if (mapData.pan_limits) {
                                            map.setMaxBounds(
                                                L.latLngBounds(
                                                    [
                                                        mapData.pan_limits
                                                            .south,
                                                        mapData.pan_limits.west,
                                                    ],
                                                    [
                                                        mapData.pan_limits
                                                            .north,
                                                        mapData.pan_limits.east,
                                                    ]
                                                )
                                            );
                                        } else {
                                            var pan_limits = {
                                                "east": "0.87890625",
                                                "north": "29.38217507514529",
                                                "south": "-49.49667452747043",
                                                "west": "-128.671875"
                                            }

                                            map.setMaxBounds(
                                                L.latLngBounds(
                                                    [
                                                        pan_limits
                                                            .south,
                                                        pan_limits.west,
                                                    ],
                                                    [
                                                        pan_limits
                                                            .north,
                                                        pan_limits.east,
                                                    ]
                                                )
                                            );


                                        }
                                    }, 400);
                                }, 200);
                            }
                        });

                        /*
                         * Markers
                         */
                        var icon = L.divIcon({
                            className: "icon icon-pin",
                            iconSize: [18, 18],
                            iconAnchor: [9, 18],
                            popupAnchor: [0, -18],
                        });
                        
                        var markerLayer = L.markerClusterGroup({
                            zIndex: 100,
                            maxClusterRadius: 38,
                            polygonOptions: {
                                fillColor: "#000",
                                color: "#000",
                                opacity: 0.3,
                                weight: 2,
                            },
                            spiderLegPolylineOptions: {
                                weight: 1,
                                color: "#222",
                                opacity: 0.4,
                            },
                            iconCreateFunction: function (cluster) {
                                var childCount = cluster.getChildCount();

                                let classes = "marker-cluster marker-cluster-";
                              
                                if (childCount < 10) {
                                    classes += "small";
                                } else if (childCount < 100) {
                                    classes += "medium";
                                } else {
                                    classes += "large";
                                }

                                var icon = L.divIcon({
                                    html: `<div><span> ${childCount}</span></div>`,
                                    className: classes,
                                    iconSize: new L.Point(40, 40),
                                });

                                return icon;
                            },
                        });

                        markerLayer.addTo(map);

                        if (scope.heatMarker) {
                            var heatLayer = L.heatLayer([], {
                                blur: 30,
                            });
                            heatLayer.addTo(map);
                        }

                        var markers = [];
                        var latlngs = [];
                        scope.$watch(
                            "markers",
                            _.debounce(function (posts) {
                                for (var key in markers) {
                                    markerLayer.removeLayer(markers[key]);
                                }
                                markers = [];
                                latlngs = [];
                                // console.log("POSTS", posts);
                                
                                for (var key in posts) {
                                    var post = posts[key];
                                    
                                    latlngs.push([post.lat, post.lng]);
                                    markers[key] = L.marker(
                                        [post.lat, post.lng],
                                        {
                                            icon: icon,
                                        }
                                    );
                                    markers[key].post = post;
                                    markers[key].bindPopup(post.message);
                                    markers[key].on("mouseover", function (ev) {
                                        ev.target.openPopup();
                                    });
                                    markers[key].on("mouseout", function (ev) {
                                        ev.target.closePopup();
                                    });
                                    markers[key].on("click", function (ev) {
                                        var params = _.extend(
                                            {
                                                focus: false,
                                            },
                                            ev.target.post.state.params
                                        );
                                        var to = "home.case";
                                        if (
                                            $state.current.name.indexOf(
                                                "dossier"
                                            ) !== -1
                                        )
                                            to = "home.dossier.case";
                                        $state.go(to, params);
                                    });
                                }
                                for (var key in markers) {
                                    markers[key].addTo(markerLayer);
                                }
                                if (scope.heatMarker)
                                    heatLayer.setLatLngs(latlngs);
                            }, 300),
                            true
                        );

                        /*
                         * Layers
                         */

                        scope.layers = [];

                        var fixed = [];
                        var swapable = [];
                        var switchable = [];

                        var layerMap = {};

                        var collapsed = false;

                        if (jQuery(window).width() <= 768) {
                            collapsed = true;
                        }

                        var layerControl = L.control
                            .layers(
                                {},
                                {},
                                {
                                    collapsed: collapsed,
                                    position: "bottomright",
                                    autoZIndex: false,
                                }
                            )
                            .addTo(map);

                        var legendControl = L.mapbox.legendControl().addTo(map);

                        layerControl.addOverlay(markerLayer, "Assassinatos");

                        map.on("layeradd", function (ev) {
                            if (ev.layer._vindig_id) {
                                if (layerMap[ev.layer._vindig_id].control)
                                    map.addControl(
                                        layerMap[ev.layer._vindig_id].control
                                    );
                                if (layerMap[ev.layer._vindig_id].legend) {
                                    legendControl.addLegend(
                                        layerMap[ev.layer._vindig_id].legend
                                    );
                                }
                            }
                        });
                        map.on("layerremove", function (ev) {
                            if (ev.layer._vindig_id) {
                                if (layerMap[ev.layer._vindig_id].control)
                                    map.removeControl(
                                        layerMap[ev.layer._vindig_id].control
                                    );
                                if (layerMap[ev.layer._vindig_id].legend) {
                                    legendControl.removeLegend(
                                        layerMap[ev.layer._vindig_id].legend
                                    );
                                }
                            }
                        });

                        scope.$watch("layers", function (layers, prevLayers) {
                            if (layers !== prevLayers || _.isEmpty(layerMap)) {
                                
                                if (prevLayers && prevLayers.length) {
                                    if (fixed.length) {
                                        _.each(fixed, function (l) {
                                            map.removeLayer(l.layer);
                                        });
                                        fixed = [];
                                    }
                                    if (swapable.length) {
                                        _.each(swapable, function (l) {
                                            layerControl.removeLayer(l.layer);
                                            if (map.hasLayer(l.layer))
                                                map.removeLayer(l.layer);
                                        });
                                        swapable = [];
                                    }
                                    if (switchable.length) {
                                        _.each(switchable, function (l) {
                                            layerControl.removeLayer(l.layer);
                                            if (map.hasLayer(l.layer))
                                                map.removeLayer(l.layer);
                                        });
                                        switchable = [];
                                    }
                                }

                                if (layers && layers.length) {
                                    _.each(layers, function (layer, i) {
                                        layer.zIndex = i + 10;
                                        layer.ID = layer.ID || "base";
                                        if (
                                            !layerMap[layer.ID] ||
                                            layer.ID == "base"
                                        )
                                            layerMap[
                                                layer.ID
                                            ] = Vindig.getLayer(layer, map);
                                        if (
                                            layer.filtering == "fixed" ||
                                            !layer.filtering
                                        ) {
                                            fixed.push(layerMap[layer.ID]);
                                            map.addLayer(
                                                layerMap[layer.ID].layer
                                            );
                                        } else if (layer.filtering == "swap") {
                                            if (layer.first_swap)
                                                map.addLayer(
                                                    layerMap[layer.ID].layer
                                                );
                                            swapable.push(layerMap[layer.ID]);
                                        } else if (
                                            layer.filtering == "switch"
                                        ) {
                                            if (!layer.hidden)
                                                map.addLayer(
                                                    layerMap[layer.ID].layer
                                                );
                                            switchable.push(layerMap[layer.ID]);
                                        }
                                    });

                                    swapable = swapable.reverse();
                                    _.each(swapable, function (layer) {
                                        layerControl.addBaseLayer(
                                            layer.layer,
                                            layer.name
                                        );
                                    });

                                    switchable = switchable.reverse();
                                    _.each(switchable, function (layer) {
                                        layerControl.addOverlay(
                                            layer.layer,
                                            layer.name
                                        );
                                    });
                                }
                            }
                        });
                    },
                };
            },
        ]);

        app.directive('customSharer', function() {
            return {
              restrict: 'E',
              templateUrl: vindig.base + "/views/sharer.html",
            }
        });
    };
})(window.vindig, window.jQuery, window.L);
