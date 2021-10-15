(function (_, undefined) {
    module.exports = function (app) {
        app.controller("TourCtrl", [
            "$scope",
            function ($scope) {
                $scope.total = 5;
                $scope.step = 1;

                $scope.nextStep = function () {
                    if ($scope.step < $scope.total) {
                        $scope.step++;
                    }
                };
                $scope.prevStep = function () {
                    if ($scope.step > 1) {
                        $scope.step--;
                    }
                };
                $scope.isStep = function (step) {
                    return $scope.step == step;
                };
            },
        ]);

        app.controller("MainCtrl", [
            "$q",
            "$rootScope",
            "$scope",
            "$state",
            "$timeout",
            "$cookies",
            "Vindig",
            function (
                $q,
                $rootScope,
                $scope,
                $state,
                $timeout,
                $cookies,
                Vindig
            ) {
                $scope.base = vindig.base;

                $scope.dialogs = {};
                $scope.showDialog = function (name) {
                    if ($scope.dialogs[name]) return true;
                    else return false;
                };
                $scope.toggleDialog = function (name) {
                    if (!$scope.dialogs[name]) $scope.dialogs[name] = true;
                    else $scope.dialogs[name] = false;
                };

                document.onkeydown = function (evt) {
                    evt = evt || window.event;
                    if (evt.keyCode == 27) {
                        $scope.$apply(function () {
                            for (var key in $scope.dialogs) {
                                $scope.dialogs[key] = false;
                            }
                        });
                    }
                };

                // Pages
                Vindig.pages().then(function (data) {
                    $scope.pages = data.data;
                });

                // Nav
                $scope.toggleNav = function () {
                    if ($scope.showNav) {
                        $scope.showNav = false;
                    } else {
                        $scope.showNav = true;
                    }
                };
                $rootScope.$on(
                    "$stateChangeStart",
                    function (ev, toState, toParams) {
                        $scope.showNav = false;
                        if (toParams.init && !$scope.initialized) {
                            $scope.init();
                        }
                    }
                );

                $rootScope.$on("mapUpdated", function (ev, map) {
                    var center = map.getCenter();
                    var zoom = map.getZoom();
                    var loc = [];
                    loc.push(center.lat);
                    loc.push(center.lng);
                    loc.push(zoom);
                    loc = loc.join(",")

                    const filters = $scope.filter;
                    const uf = filters.strict.uf;
                    const povo = filters.strict.povo;
                    const text = filters.text;
                    const date_min = filters.date.min;
                    const date_max = filters.date.max;
                    // console.log({ ...$state.params, loc, uf, povo, text, date_min, date_max })

                    $scope.embedUrl = $state.href(
                        $state.current.name || "home",
                        { ...$state.params, loc, uf, povo, text, date_min, date_max },
                        { absolute: true }
                    );
                });

                $rootScope.$on("updatedFilters", function (ev, map) {
                    const filters = $scope.filter;
                    const uf = filters.strict.uf;
                    const povo = filters.strict.povo;
                    const text = filters.text;
                    const date_min = filters.date.min;
                    const date_max = filters.date.max;
                    // console.log({ ...$state.params, uf, povo, text, date_min, date_max })

                    $scope.embedUrl = $state.href(
                        $state.current.name || "home",
                        { ...$state.params, uf, povo, text, date_min, date_max },
                        { absolute: true }
                    );
                })

                

                $scope.getEmbedUrl = function () {
                    return encodeURIComponent($scope.embedUrl);
                };

                // Dossiers
                $scope.toggleDossiers = function () {
                    if ($scope.showDossiers) {
                        $scope.showDossiers = false;
                    } else {
                        $scope.showDossiers = true;
                    }
                };
                $rootScope.$on("$stateChangeStart", function () {
                    $scope.showDossiers = false;
                });

                // Adv nav
                $scope.toggleAdvFilters = function () {
                    if ($scope.showAdvFilters) {
                        $scope.showAdvFilters = false;
                    } else {
                        $scope.showAdvFilters = true;
                    }
                };
                $rootScope.$on("$stateChangeStart", function () {
                    $scope.showAdvFilters = false;
                });

                $scope.home = function () {
                    if ($state.current.name == "home")
                        $scope.initialized = false;
                };
                $scope.init = function () {
                    $scope.initialized = true;
                    $scope.showList = true;
                };

                $scope.$watch("initialized", function (init) {
                    if ($state.current && $state.current.name) {
                        if (init) {
                            $state.go(
                                $state.current.name,
                                { init: true },
                                { notify: false }
                            );
                        } else if ($state.params.init) {
                            $state.go(
                                $state.current.name,
                                { init: false },
                                { notify: false }
                            );
                        }
                    }
                    $timeout(function () {
                        $rootScope.$broadcast("invalidateMap");
                    }, 200);
                });

                if (
                    $state.current.name == "home.dossier" ||
                    $state.current.name == "home.dossier.case"
                )
                    $scope.isDossier = true;
                else $scope.isDossier = false;

                if ($state.current.name == "home.case") $scope.isCase = true;
                else $scope.isCase = false;

                $rootScope.$on("dossierCases", function (ev, cases) {
                    $scope.dossierCases = cases;
                });

                if (!$cookies.get("accessed_tour")) {
                    $cookies.put("accessed_tour", 0);
                }
                $scope.accessedTour = $cookies.get("accessed_tour");

                $scope.disableTour = function () {
                    $cookies.put("accessed_tour", 1);
                    $scope.accessedTour = 1;
                };

                $rootScope.$on(
                    "$stateChangeSuccess",
                    function (ev, toState, toParams, fromState, fromParams) {
                        if (toState.name !== "home") $scope.initialized = true;

                        if (toState.name == "home.tour") {
                            $scope.showList = true;
                            $cookies.put("accessed_tour", 1);
                            $scope.accessedTour = 1;
                        }

                        if (fromState && fromState.name == "home.case")
                            $rootScope.$broadcast("invalidateMap");
                    }
                );

                $rootScope.$on(
                    "$stateChangeStart",
                    function (ev, toState, toParams, fromState) {
                        if (
                            toState.name != "home.dossier" &&
                            toState.name != "home.dossier.case"
                        ) {
                            $scope.dossierCases = false;
                        }

                        if (
                            toState.name == "home.dossier" ||
                            toState.name == "home.dossier.case"
                        )
                            $scope.isDossier = true;
                        else $scope.isDossier = false;

                        if (toState.name == "home.case") $scope.isCase = true;
                        else $scope.isCase = false;

                        if (
                            (fromState &&
                                fromState.name == "home.dossier" &&
                                toState.name != "home.dossier.case") ||
                            (fromState.name == "home.dossier.case" &&
                                toState.name != "home.dossier")
                        ) {
                            $scope.filter.strict = {};
                        }
                    }
                );

                $scope.$watch("isDossier", function (isDossier, prev) {
                    if (isDossier !== prev) {
                        $rootScope.$broadcast("invalidateMap");
                    }
                });

                $scope.filtered = [];
                $scope.casos = [];

                // Async get cases
                $scope.loading = true;
                Vindig.cases().then(function (res) {
                    // console.log(res);
                    var promises = [];
                    $scope.casos = res.data;
                    var totalPages = res.headers("X-WP-TotalPages");
                    for (var i = 2; i <= totalPages; i++) {
                        promises.push(Vindig.cases({ page: i }));
                        promises[i - 2].then(function (res) {
                            // This will fix sorting
                            var reshapedCases = res.data.map( singleCase => {
                                return {
                                    ...singleCase,
                                    ...singleCase.meta,
                                }
                            } )
                            // console.log(reshapedCases);
                            $scope.casos = $scope.casos.concat(reshapedCases);
                        });
                    }
                    $q.all(promises).then(function () {
                        $scope.loading = false;
                        $rootScope.$broadcast("doneLoading", $scope);
                    });
                });

                $scope.itemsPerPage = 20;
                $scope.currentPage = 0;

                $scope.prevPage = function () {
                    if ($scope.currentPage > 0) {
                        $scope.currentPage--;
                    }
                };

                $scope.prevPageDisabled = function () {
                    return $scope.currentPage === 0 ? "disabled" : "";
                };

                $scope.pageCount = function () {
                    return (
                        Math.ceil(
                            $scope.filtered.length / $scope.itemsPerPage
                        ) - 1
                    );
                };

                $scope.nextPage = function () {
                    if ($scope.currentPage < $scope.pageCount()) {
                        $scope.currentPage++;
                    }
                };

                $scope.nextPageDisabled = function () {
                    return $scope.currentPage === $scope.pageCount()
                        ? "disabled"
                        : "";
                };

                $rootScope.$on("nextCase", function (ev, caso) {
                    var i;
                    _.each($scope.filtered, function (c, index) {
                        if (c.id == caso.id) i = index;
                    });
                    if (i >= 0 && $scope.filtered[i + 1]) {
                        $state.go("home.case", {
                            caseId: $scope.filtered[i + 1].id,
                        });
                    }
                });

                $rootScope.$on("prevCase", function (ev, caso) {
                    var i;
                    _.each($scope.filtered, function (c, index) {
                        if (c.id == caso.id) i = index;
                    });
                    if (i >= 0 && $scope.filtered[i - 1]) {
                        $state.go("home.case", {
                            caseId: $scope.filtered[i - 1].id,
                        });
                    }
                });

                $rootScope.$on("nextDossier", function (ev, dossier) {
                    var i;
                    _.each($scope.dossiers, function (d, index) {
                        if (d.id == dossier.id) i = index;
                    });
                    if (i >= 0 && $scope.dossiers[i + 1]) {
                        $state.go("home.dossier", {
                            dossierId: $scope.dossiers[i + 1].id,
                        });
                    }
                });

                $rootScope.$on("prevDossier", function (ev, dossier) {
                    var i;
                    _.each($scope.dossiers, function (d, index) {
                        if (d.id == dossier.id) i = index;
                    });
                    if (i >= 0 && $scope.dossiers[i - 1]) {
                        $state.go("home.dossier", {
                            dossierId: $scope.dossiers[i - 1].id,
                        });
                    }
                });

                Vindig.dossiers().then(function (res) {
                    $scope.dossiers = res.data;
                });

                $scope.filter = {
                    text: "",
                    strict: {},
                    date: {
                        min: 0,
                        max: 0,
                    },
                };
                $scope.dateFilters = [0, 0];
                $scope.dropdownFilters = {};

                var setFilters = function (casos) {
                    var anos = _.sortBy(
                        Vindig.getUniq(casos, "ano"),
                        function (item) {
                            return parseInt(item);
                        }
                    );

                    // console.log("ANOS", anos);

                    if (anos.length) {
                        if (
                            !$scope.dateFilters[0] ||
                            parseInt(_.min(anos)) < $scope.dateFilters[0]
                        ) {
                            $scope.dateFilters[0] = parseInt(_.min(anos));
                            $scope.filter.date.min = parseInt(_.min(anos));
                        }

                        if (
                            !$scope.dateFilters[1] ||
                            parseInt(_.max(anos)) > $scope.dateFilters[1]
                        ) {
                            $scope.dateFilters[1] = parseInt(_.max(anos));
                            $scope.filter.date.max = parseInt(_.max(anos));
                        }

                        if (!$scope.filter.strict.uf)
                            $scope.dropdownFilters.uf = _.sortBy(
                                Vindig.getUniq(casos, "uf"),
                                function (item) {
                                    return item;
                                }
                            );

                        if (!$scope.filter.strict.relatorio)
                            $scope.dropdownFilters.relatorio = _.sortBy(
                                Vindig.getUniq(casos, "relatorio"),
                                function (item) {
                                    return item;
                                }
                            );

                        if (!$scope.filter.strict.povo)
                            $scope.dropdownFilters.povo = _.sortBy(
                                Vindig.getUniq(casos, "povo"),
                                function (item) {
                                    return item;
                                }
                            );
                    }
                };

                $scope.$watch("casos", setFilters);

                var filterString =
                    "casos | filter:filter.text | exact:filter.strict | dateFilter:filter.date | caseIds:dossierCases";

                $rootScope.$on(
                    "caseQuery",
                    function (ev, query) {
                        $scope.filter.strict = query;
                    },
                    true
                );

                // $rootScope.$on("updatedFilters", function (ev, filters) {
                //     console.log("AAAAAAAAAAAA", filters, $state.current.name);
                //     if($state.current.name.length) {
                //         const uf = filters.strict.uf;
                //         const povo = filters.strict.povo;
                //         const text = filters.text;
                //         const date_min = filters.date.min;
                //         const date_max = filters.date.max;

                //         $state.go(
                //             $state.current.name,
                //             { uf, povo, text, date_min, date_max },
                //             {
                //                 notify: false,
                //                 location: "replace",
                //             }
                //         );
                //     }
                // });

                $scope.$watch(
                    filterString,
                    function (casos) {
                        $scope.filtered = casos;
                        setFilters(casos);
                        $rootScope.$broadcast("updatedFilters", $scope.filter);
                    },
                    true
                );

                var csvKeys = [
                    "aldeia",
                    "ano",
                    "apelido",
                    "cod_funai",
                    "cod_ibge",
                    "coordinates",
                    "descricao",
                    "dia",
                    "mes",
                    "ano",
                    "fonte_cimi",
                    "idade",
                    "municipio",
                    "uf",
                    "nome",
                    "povo",
                    "relatorio",
                    "terra_indigena",
                ];
                $scope.downloadCasos = function (casos) {
                    var toCsv = [];
                    _.each(casos, function (caso) {
                        //console.log(caso);
                        var c = {};
                        _.each(csvKeys, function (k) {
                            
                            if(k == "coordinates" && caso._related_point && caso._related_point.length) 
                                caso.meta[k] = JSON.stringify([ caso['_related_point'][0]._geocode_lat, caso['_related_point'][0]._geocode_lon ]);
                            else if (k == "coordinates" && !caso._related_point)
                                caso.meta[k] = ""

                            c[k] = caso.meta[k];
                            if (typeof c[k] == "string")
                                c[k] = c[k].replace(/"/g, '""').replace(/(<([^>]+)>)/gi, "");

                        });
                        toCsv.push(c);
                        // add terms from taxonomy tipo_violncia
                        if ( caso._embedded[ 'wp:term'][0] && caso._embedded[ 'wp:term'][0].length && caso._embedded[ 'wp:term'][0].length > 0 ) {
                            _.each(caso._embedded[ 'wp:term'][0], function (term) {
                                if( typeof c[ 'tipos_de_violencia'] === 'undefined' ) {
                                    c[ 'tipos_de_violencia'] = term.name;
                                } else {
                                    c[ 'tipos_de_violencia' ] = c[ 'tipos_de_violencia' ] + ', ' + term.name;
                                }
                                // tipos_de_violencia
                                if ( term.taxonomy !== 'tipo_de_violncia' ) {
                                    return;
                                }
                            });    
                        }
                    });
                    
                    JSONToCSV(toCsv, "casos", true);
                };

                $scope.clearFilters = function () {
                    $scope.filter.text = "";
                    if (typeof anos != "undefined" && anos && anos.length) {
                        $scope.filter.date.min = parseInt(_.min(anos));
                        $scope.filter.date.max = parseInt(_.max(anos));
                    }
                    $scope.filter.strict = {};
                };

                $scope.$on(
                    "$stateChangeSuccess",
                    function (ev, toState, toParams, fromState, fromParams) {
                        if (
                            fromState &&
                            toState.name == "home.dossier" &&
                            fromState.name != "home.dossier.case"
                        ) {
                            $scope.clearFilters();
                        }
                    }
                );

                $scope.focusMap = function (caso) {
                    var geolocatedData = caso.meta._related_point[0];
                    var coordinates = [
                        geolocatedData._geocode_lon,
                        geolocatedData._geocode_lat,
                    ];
                    // console.log("coordinates", coordinates);
                    $rootScope.$broadcast("focusMap", coordinates);
                };

                // Case list
                $scope.showList = false;
                $scope.toggleCasos = function () {
                    if ($scope.showList) {
                        $scope.showList = false;
                    } else {
                        $scope.showList = true;
                    }
                };
                $scope.$watch("showList", function () {
                    $timeout(function () {
                        $rootScope.$broadcast("invalidateMap");
                    }, 300);
                });
            },
        ]);

        app.controller("HomeCtrl", [
            "$scope",
            "$rootScope",
            "$timeout",
            "Map",
            function ($scope, $rootScope, $timeout, Map) {
                $scope.$on("$stateChangeSuccess", function (ev, toState) {
                    if (
                        toState.name == "home" ||
                        toState.name == "home.tour" ||
                        toState.name == "home.case" ||
                        toState.name == "home.page"
                    ) {
                        $scope.mapData = Map;
                    }
                });

                $scope.$on("dossierMap", function (ev, map) {
                    $scope.mapData = map;
                });
            },
        ]);

        app.controller("DossierCtrl", [
            "$rootScope",
            "$timeout",
            "$scope",
            "$sce",
            "Dossier",
            "DossierMap",
            "$state",
            function (
                $rootScope,
                $timeout,
                $scope,
                $sce,
                Dossier,
                Map,
                $state
            ) {
                // console.log("Dossier.data", Dossier.data);

                $scope.url = $state.href(
                    "home.dossier",
                    { id: Dossier.data.id },
                    {
                        absolute: true,
                    }
                );

                $scope.dossier = Dossier.data;
                $scope.dossier.content = $sce.trustAsHtml(
                    $scope.dossier.content.rendered
                );

                $scope.dossier.title = $sce.trustAsHtml(
                    $scope.dossier.title.rendered
                );

                if($scope.dossier._embedded.author && $scope.dossier._embedded.author.length) {
                    $scope.dossier.author = $scope.dossier._embedded.author[0]
                }

                $scope.dossier.excerpt = $sce.trustAsHtml(
                    $scope.dossier.excerpt.rendered
                );
                $scope.$emit("dossierMap", Map);
                $timeout(function () {
                    $rootScope.$broadcast("invalidateMap");
                }, 300);

                if ($scope.dossier.meta.casos && $scope.dossier.meta.casos.length && $scope.dossier.meta.casos[0] != "") {
                    $rootScope.$broadcast("dossierCases", $scope.dossier.meta.casos);
                } else if ($scope.dossier.meta.casos_query) {
                    var preQuery = $scope.dossier.meta.casos_query.split(";");
                    var casosQuery = {};
                    _.each(preQuery, function (prop) {
                        if (prop) {
                            kv = prop.split("=");
                            if (kv.length) {
                                if (kv[1].indexOf("/") == 0) {
                                    casosQuery[kv[0].trim()] = new RegExp(
                                        kv[1].substring(1, kv[1].length - 1)
                                    );
                                } else {
                                    casosQuery[kv[0].trim()] = kv[1].replace(
                                        /"/g,
                                        ""
                                    );
                                }
                            }
                        }
                    });
                    $rootScope.$broadcast("caseQuery", casosQuery);
                }

                $scope.base = vindig.base;
                $scope.hiddenContent = false;
                $scope.shareParams = {title: $scope.dossier.title, url: encodeURIComponent($scope.url)}
                
                $scope.toggleContent = function () {
                    if ($scope.hiddenContent) {
                        $scope.hiddenContent = false;
                    } else {
                        $scope.hiddenContent = true;
                    }
                };

                $scope.next = function () {
                    $rootScope.$broadcast("nextDossier", $scope.dossier);
                };

                $scope.prev = function () {
                    $rootScope.$broadcast("prevDossier", $scope.dossier);
                };
                
            },
        ])
        

        app.controller("CaseCtrl", [
            "$rootScope",
            "$state",
            "$stateParams",
            "$scope",
            "$sce",
            "$filter",
            "Case",
            "Vindig",
            function (
                $rootScope,
                $state,
                $stateParams,
                $scope,
                $sce,
                $filter,
                Case,
                Vindig
            ) {

                $scope.url = $state.href(
                    "home.case",
                    { id: Case.data.id },
                    {
                        absolute: true,
                    }
                );

                Case.data = {
                    ...Case.data,
                    ...Case.data.meta,
                    coordinates: [
                        Case.data.meta._related_point[0]._geocode_lon,
                        Case.data.meta._related_point[0]._geocode_lat,
                    ]
                }

                $scope.caso = Case.data;
                $scope.caso.content = $sce.trustAsHtml($scope.caso.content.rendered);
                $scope.caso.descricao = $sce.trustAsHtml($scope.caso.descricao);
                if ($stateParams.focus != false) {
                    $rootScope.$broadcast("focusMap", $scope.caso.coordinates);
                }
                $rootScope.$broadcast("invalidateMap");

                $scope.report = function (message) {
                    Vindig.report($scope.caso.id, message)
                        .success(function (data) {
                            $scope.reported = true;
                        })
                        .error(function (err) {
                            console.log(err);
                        });
                };

                $scope.close = function () {
                    if ($state.current.name.indexOf("dossier") !== -1) {
                        $state.go("home.dossier", $state.current.params);
                    } else {
                        $state.go("home");
                    }
                };

                $scope.next = function () {
                    $rootScope.$broadcast("nextCase", $scope.caso);
                };

                $scope.prev = function () {
                    $rootScope.$broadcast("prevCase", $scope.caso);
                };

                $scope.shareParams = {title: $filter('casoName')($scope.caso), url: encodeURIComponent($scope.url)}
            },
        ]);

        app.controller("PageCtrl", [
            "$scope",
            "$sce",
            "Page",
            "Vindig",
            function ($scope, $sce, Page, Vindig) {
                $scope.page = Page.data;
                console.log("Page.data", Page.data)
                $scope.page.content = $sce.trustAsHtml($scope.page.content.rendered);

                $scope.contacted = false;
                $scope.contacting = false;
                $scope.contact = function (message) {
                    if (!$scope.contacting) {
                        $scope.contacting = true;
                        Vindig.contact(message)
                            .success(function (data) {
                                $scope.contacted = true;
                                $scope.contacting = false;
                            })
                            .error(function (err) {
                                console.log(err);
                            });
                    }
                };
            },
        ]);
    };
})(window._);
