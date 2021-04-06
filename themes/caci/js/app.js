(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

                $rootScope.$on("$stateChangeSuccess", function () {
                    $scope.embedUrl = $state.href(
                        $state.current.name || "home",
                        $state.params,
                        { absolute: true }
                    );
                });

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

                $scope.$watch(
                    filterString,
                    function (casos) {
                        $scope.filtered = casos;
                        setFilters(casos);
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
                        console.log(caso);
                        var c = {};
                        _.each(csvKeys, function (k) {
                            
                            if(k == "coordinates" && caso._related_point && caso._related_point.length) 
                                caso.meta[k] = JSON.stringify([ caso['_related_point'][0]._geocode_lat, caso['_related_point'][0]._geocode_lon ]);
                            else if (k == "coordinates" && !caso._related_point)
                                caso.meta[k] = ""

                            c[k] = caso.meta[k];
                            if (typeof c[k] == "string")
                                c[k] = c[k].replace(/"/g, '""');

                        });
                        toCsv.push(c);
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
                console.log("Dossier.data", Dossier.data);

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

                $scope.whatsapp =
                    "whatsapp://send?text=" +
                    encodeURIComponent($scope.dossier.title.rendered + " " + $scope.url);
                $scope.base = vindig.base;

                $scope.hiddenContent = false;
                $scope.toggleContent = function () {
                    if ($scope.hiddenContent) {
                        $scope.hiddenContent = false;
                    } else {
                        $scope.hiddenContent = true;
                    }
                };
            },
        ]);

        app.controller("CaseCtrl", [
            "$rootScope",
            "$state",
            "$stateParams",
            "$scope",
            "$sce",
            "Case",
            "Vindig",
            function (
                $rootScope,
                $state,
                $stateParams,
                $scope,
                $sce,
                Case,
                Vindig
            ) {
                Case.data = {
                    ...Case.data,
                    ...Case.data.meta,
                    coordinates: [
                        Case.data.meta._related_point[0]._geocode_lon,
                        Case.data.meta._related_point[0]._geocode_lat,
                    ]
                }

                $scope.caso = Case.data;
                $scope.caso.content = $sce.trustAsHtml($scope.caso.content);
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
            },
        ]);

        app.controller("PageCtrl", [
            "$scope",
            "$sce",
            "Page",
            "Vindig",
            function ($scope, $sce, Page, Vindig) {
                $scope.page = Page.data;
                $scope.page.content = $sce.trustAsHtml($scope.page.content);

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

},{}],2:[function(require,module,exports){
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
                                    
                                    // console.log("loc.length", loc.length);
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
                            className: "pin",
                            iconSize: [18, 18],
                            iconAnchor: [9, 18],
                            popupAnchor: [0, -18],
                        });

                        var markerLayer = L.markerClusterGroup({
                            zIndex: 100,
                            maxClusterRadius: 40,
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

                                var c = " marker-cluster-";
                                if (childCount < 10) {
                                    c += "small";
                                } else if (childCount < 100) {
                                    c += "medium";
                                } else {
                                    c += "large";
                                }

                                var icon = L.divIcon({
                                    html:
                                        "<div><span>" +
                                        childCount +
                                        "</span></div>",
                                    className: "marker-cluster" + c,
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
    };
})(window.vindig, window.jQuery, window.L);

},{}],3:[function(require,module,exports){
(function (_, undefined) {
    module.exports = function (app) {
        app.filter("emptyToEnd", function () {
            return function (array, key) {
                if (!angular.isArray(array)) return;
                var present = array.filter(function (item) {
                    return item[key];
                });
                var empty = array.filter(function (item) {
                    return !item[key];
                });
                return present.concat(empty);
            };
        });

        app.filter("offset", function () {
            return function (input, start) {
                start = parseInt(start, 10);
                return input.slice(start);
            };
        });

        app.filter("exact", function () {
            return function (input, match) {
                var matching = [],
                    matches,
                    falsely = true;

                // Return the input unchanged if all filtering attributes are falsy
                angular.forEach(match, function (value, key) {
                    falsely = falsely && !value;
                });
                if (falsely) {
                    return input;
                }

                angular.forEach(input, function (item) {
                    // e.g. { title: "ball" }
                    matches = true;
                    angular.forEach(match, function (value, key) {
                        // e.g. 'all', 'title'
                        if (!!value) {
                            // do not compare if value is empty
                            if (value.indexOf("^") == 0) {
                                var regex = new RegExp(value);
                                matches = matches && regex.test(item[key]);
                            } else {
                                matches = matches && item[key] === value;
                            }
                        }
                    });
                    if (matches) {
                        matching.push(item);
                    }
                });
                return matching;
            };
        });

        app.filter("caseIds", function () {
            return function (input, cases) {
                if (cases && cases.length) {
                    input = _.filter(input, function (item) {
                        return cases.indexOf(item.id) != -1;
                    });
                }
                return input;
            };
        });

        app.filter("casoName", [
            function () {
                return function (input) {
                    var data = input.meta;

                    var name = "";
                    if (data) {
                        if (data.nome) {
                            name += data.nome;
                            if (data.apelido) {
                                name += " (" + data.apelido + ")";
                            }
                        } else if (data.apelido) {
                            name += data.apelido;
                        } else {
                            name += "Não identificado";
                        }
                        // if(input.idade) {
                        //   name += ', ' + input.idade + ' anos';
                        // }
                    }
                    return name;
                };
            },
        ]);

        app.filter("casoDate", [
            "$sce",
            function ($sce) {
                return function (input) {
                    var data = input.meta;
                    var date = "";
                    if (data.ano) {
                        date = '<span class="ano">' + data.ano + "</span>";
                    }
                    if (data.mes) {
                        date += '<span class="mes">/' + data.mes + "</span>";
                    }
                    if (data.dia) {
                        date += '<span class="dia">/' + data.dia + "</span>";
                    }
                    return $sce.trustAsHtml(date);
                };
            },
        ]);

        app.filter("caseLocation", [
            "$sce",
            function ($sce) {
                return function (input, showLabels) {
                    var location = "";
                    var data = input.meta;

                    if (data.terra_indigena) {
                        if (showLabels)
                            location =
                                '<span class="ti"><span class="label">Terra indígena</span> ' +
                                data.terra_indigena +
                                "</span>";
                        else
                            location =
                                '<span class="ti">' +
                                data.terra_indigena +
                                "</span>";
                    }
                    if (data.municipio) {
                        if (showLabels)
                            location +=
                                '<span class="mun"><span class="label">Município</span> ' +
                                data.municipio +
                                "</span>";
                        else
                            location +=
                                '<span class="mun">' +
                                data.municipio +
                                "</span>";
                    }
                    if (data.uf) {
                        if (showLabels)
                            location +=
                                '<span class="uf"><span class="label">Estado</span> ' +
                                data.uf +
                                "</span>";
                        else
                            location +=
                                '<span class="uf">' + data.uf + "</span>";
                    }
                    return $sce.trustAsHtml(location);
                };
            },
        ]);

        app.filter("dateFilter", [
            function () {
                return function (input, range) {
                    if (input && input.length) {
                        input = _.filter(input, function (item) {
                            var ano = parseInt(item.meta.ano);
                            return ano >= range.min && ano <= range.max;
                        });
                    }
                    return input;
                };
            },
        ]);

        app.filter("postToMarker", [
            "casoNameFilter",
            "$state",
            function (casoNameFilter, $state) {
                return _.memoize(
                    function (input, defaultParentState, stateWhitelist) {
                        var state = "";

                        if ($state.current.name == stateWhitelist) {
                            state += stateWhitelist + ".";
                        } else if (defaultParentState) {
                            state += defaultParentState + ".";
                        }

                        if (input && input.length) {
                            var markers = {};

                            _.each(input, function (post) {
                                var postMeta = post.meta;

                                if (postMeta._related_point && postMeta._related_point.length) {
                                    var geolocatedData = postMeta._related_point[0];

                                    params = {};
                                    params[post.type + "Id"] = post.id;
                                    markers[post.id] = {
                                        lat: geolocatedData._geocode_lat,
                                        lng: geolocatedData._geocode_lon,
                                        message:
                                            "<h2>" +
                                            casoNameFilter(post) +
                                            "</h2>",
                                        state: {
                                            name: state + post.type,
                                            params: params,
                                        },
                                    };
                                }
                            });

                            return markers;
                        }

                        return {};
                    },
                    function () {
                        return JSON.stringify(arguments);
                    }
                );
            },
        ]);
    };
})(window._);

},{}],4:[function(require,module,exports){
require("./util");

(function (angular, vindig, undefined) {
    var app = angular.module(
        "vindigena",
        [
            "ui.router",
            "ngCookies",
            "djds4rce.angular-socialshare",
            "ui-rangeSlider",
            "fitVids",
        ],
        [
            "$compileProvider",
            function ($compileProvider) {
                $compileProvider.aHrefSanitizationWhitelist(
                    /^\s*(https?|ftp|mailto|whatsapp|file):/
                );
            },
        ]
    );

    app.config([
        "$stateProvider",
        "$urlRouterProvider",
        "$locationProvider",
        "$httpProvider",
        function (
            $stateProvider,
            $urlRouterProvider,
            $locationProvider,
            $httpProvider
        ) {
            $locationProvider.html5Mode({
                enabled: false,
                requireBase: false,
            });
            $locationProvider.hashPrefix("!");

            $stateProvider
                .state("home", {
                    url: "/?loc&init",
                    controller: "HomeCtrl",
                    templateUrl: vindig.base + "/views/index.html",
                    reloadOnSearch: false,
                    resolve: {
                        Map: [
                            "$q",
                            "Vindig",
                            function ($q, Vindig) {
                                var deferred = $q.defer();
                                if (vindig.featured_map) {
                                    Vindig.getMap(vindig.featured_map).then(
                                        function (data) {
                                            deferred.resolve(data.data);
                                        }
                                    );
                                } else {
                                    Vindig.maps().then(function (data) {
                                        deferred.resolve(data.data[0]);
                                    });
                                }
                                return deferred.promise;
                            },
                        ],
                    },
                })
                .state("home.tour", {
                    url: "tour/",
                    controller: "TourCtrl",
                    templateUrl: vindig.base + "/views/tour.html",
                    reloadOnSearch: false,
                })
                .state("home.page", {
                    url: "p/:id/",
                    controller: "PageCtrl",
                    templateUrl: vindig.base + "/views/page.html",
                    reloadOnSearch: false,
                    resolve: {
                        Page: [
                            "$stateParams",
                            "Vindig",
                            function ($stateParams, Vindig) {
                                return Vindig.getPost($stateParams.id);
                            },
                        ],
                    },
                })
                .state("home.case", {
                    url: "caso/:caseId/",
                    controller: "CaseCtrl",
                    templateUrl: vindig.base + "/views/case.html",
                    reloadOnSearch: false,
                    params: {
                        focus: true,
                    },
                    resolve: {
                        Case: [
                            "$stateParams",
                            "Vindig",
                            function ($stateParams, Vindig) {
                                // console.log("caseId", $stateParams.caseId);
                                return Vindig.getCase($stateParams.caseId);
                            },
                        ],
                    },
                })
                .state("home.dossier", {
                    url: "dossie/:dossierId/",
                    controller: "DossierCtrl",
                    templateUrl: vindig.base + "/views/dossier.html",
                    reloadOnSearch: false,
                    resolve: {
                        Dossier: [
                            "$stateParams",
                            "Vindig",
                            function ($stateParams, Vindig) {
                                return Vindig.getDossier($stateParams.dossierId);
                            },
                        ],
                        DossierMap: [
                            "$q",
                            "Dossier",
                            "Vindig",
                            function ($q, Dossier, Vindig) {
                                var mapId = Dossier.data.meta.maps.length
                                    ? Dossier.data.meta.maps[0]
                                    : vindig.featured_map;
                                var deferred = $q.defer();
                                Vindig.getMap(mapId).then(function (data) {
                                    deferred.resolve(data.data);
                                });
                                return deferred.promise;
                            },
                        ],
                    },
                })
                .state("home.dossier.case", {
                    url: ":caseId/",
                    controller: "CaseCtrl",
                    templateUrl: vindig.base + "/views/case.html",
                    params: {
                        focus: true,
                    },
                    reloadOnSearch: false,
                    resolve: {
                        Case: [
                            "$stateParams",
                            "Vindig",
                            function ($stateParams, Vindig) {
                                return Vindig.getPost($stateParams.caseId);
                            },
                        ],
                    },
                });

            /*
             * Trailing slash rule
             */
            $urlRouterProvider.rule(function ($injector, $location) {
                var path = $location.path(),
                    search = $location.search(),
                    params;

                // check to see if the path already ends in '/'
                if (path[path.length - 1] === "/") {
                    return;
                }

                // If there was no search string / query params, return with a `/`
                if (Object.keys(search).length === 0) {
                    return path + "/";
                }

                // Otherwise build the search string and return a `/?` prefix
                params = [];
                angular.forEach(search, function (v, k) {
                    params.push(k + "=" + v);
                });

                return path + "/?" + params.join("&");
            });
        },
    ]).run([
        "$rootScope",
        "$window",
        "$location",
        "$FB",
        function ($rootScope, $window, $location, $FB) {
            $FB.init("1496777703986386");

            $rootScope.$on(
                "$stateChangeSuccess",
                function (ev, toState, toParams, fromState, fromParams) {
                    if ($window._gaq) {
                        $window._gaq.push(["_trackPageview", $location.path()]);
                    }
                    // Scroll top
                    if (
                        fromState.name &&
                        fromState.name.indexOf("dossier") == -1 &&
                        toState.name.indexOf("dossier") == -1
                    ) {
                        jQuery("html,body").animate(
                            {
                                scrollTop: 0,
                            },
                            400
                        );
                    }
                }
            );
        },
    ]);

    require("./services")(app);
    require("./filters")(app);
    require("./directives")(app);
    require("./controllers")(app);

    angular.element(document).ready(function () {
        angular.bootstrap(document, ["vindigena"]);
    });
})(window.angular, window.vindig);

},{"./controllers":1,"./directives":2,"./filters":3,"./services":5,"./util":6}],5:[function(require,module,exports){
(function (vindig, L, undefined) {
    module.exports = function (app) {
        // Proper serialization
        app.config([
            "$httpProvider",
            function ($httpProvider) {
                $httpProvider.defaults.paramSerializer =
                    "$httpParamSerializerJQLike";
            },
        ]);

        app.factory("Vindig", [
            "$http",
            function ($http) {
                return {
                    pages: function (params, filter) {
                        params = params || {};
                        params = _.extend(
                            {
                                type: "page",
                            },
                            params
                        );

                        filter = filter || {};
                        filter = _.extend(
                            {
                                posts_per_page: 50,
                                orderby: "menu_order",
                                order: "ASC",
                            },
                            filter
                        );

                        params.filter = filter;

                        return $http({
                            method: "GET",
                            url: vindig.api + "/posts",
                            params: params,
                        });
                    },
                    maps: function (params, filter) {
                        params = params || {};
                        params = _.extend(
                            {
                                type: "map",
                            },
                            params
                        );

                        filter = filter || {};
                        filter = _.extend(
                            {
                                posts_per_page: 50,
                            },
                            filter
                        );

                        params.filter = filter;

                        return $http({
                            method: "GET",
                            url: vindig.api + "/posts",
                            params: params,
                        });
                    },
                    cases: function (params, filter) {
                        params = params || {};
                        params = _.extend(
                            // {
                            //     type: "case",
                            // },
                            params
                        );

                        filter = filter || {};
                        filter = _.extend(
                            {
                                posts_per_page: 40,
                                without_map_query: 1,
                            },
                            filter
                        );

                        params.filter = filter;

                        return $http({
                            method: "GET",
                            url: vindig.api + "/case",
                            params: params,
                        });
                    },
                    report: function (id, message) {
                        return $http({
                            method: "POST",
                            url: vindig.api + "/posts/" + id + "/denuncia",
                            data: {
                                message: message,
                            },
                        });
                    },
                    contact: function (message) {
                        return $http({
                            method: "POST",
                            url: vindig.api + "/contact",
                            data: message,
                        });
                    },
                    dossiers: function (params, filter) {
                        params = params || {};
                        params = _.extend(
                            // {
                            //     type: "dossier",
                            // },
                            params
                        );

                        filter = filter || {};
                        filter = _.extend(
                            {
                                posts_per_page: 50,
                                without_map_query: 1,
                            },
                            filter
                        );

                        params.filter = filter;

                        return $http({
                            method: "GET",
                            url: vindig.api + "/dossier",
                            params: params,
                        });
                    },
                    getLayer: function (layerObj, map) {
                        var layer = {
                            name: layerObj.title || "",
                        };
                        if (layerObj.type == "mapbox") {
                            var tileLayer = L.mapbox.tileLayer(
                                layerObj.mapbox_id
                            );
                            var gridLayer = L.mapbox.gridLayer(
                                layerObj.mapbox_id
                            );
                            layer.layer = L.layerGroup([tileLayer, gridLayer]);
                            layer.control = L.mapbox.gridControl(gridLayer);
                        } else if (layerObj.type == "tilelayer") {
                            layer.layer = L.tileLayer(layerObj.tile_url);
                        }

                        if (layerObj.legend) {
                            layer.legend = layerObj.legend;
                        }

                        if (layer.layer) {
                            if (layerObj.zIndex) {
                                layer.layer.setZIndex(layerObj.zIndex);
                            }
                            layer.layer._vindig_id = layerObj.ID;
                        }
                        return layer;
                    },
                    getPost: function (id) {
                        return $http.get(vindig.api + "/posts/" + id);
                    },
                    getDossier: function (id) {                        
                        return $http({
                            method: "GET",
                            url: vindig.api + `/dossier/${id}`,
                            params: {
                                _embed: true,
                            },
                        });
                    },
                    getCase: function (id) {
                        return $http.get(vindig.api + "/case/" + id);
                    },
                    getMap: function (id) {
                        return $http.get(vindig.api + "/map/" + id);
                    },
                    getUniq: function (list, param, uniqParam) {
                        // console.log(param, uniqParam,list)
                        var vals = [];
                        _.each(list, function (item) {
                            if (item.meta[param]) {
                                if (angular.isArray(item.meta[param])) {
                                    if (item.meta[param].length)
                                        vals = vals.concat(item.meta[param]);
                                } else vals.push(item.meta[param]);
                            }
                        });
                        if (vals.length) {
                            var uniq = _.uniq(vals, function (item, key) {
                                if (
                                    typeof uniqParam !== "undefined" &&
                                    item[uniqParam]
                                ) {
                                    return item[uniqParam];
                                } else {
                                    return item;
                                }
                            });
                            return _.compact(uniq);
                        } else {
                            return [];
                        }
                    },
                };
            },
        ]);
    };
})(window.vindig, window.L);

},{}],6:[function(require,module,exports){
window.JSONToCSV = function(JSONData, ReportTitle, ShowLabel) {
  //If JSONData is not an object then JSON.parse will parse the JSON string in an Object
  var arrData = typeof JSONData != 'object' ? JSON.parse(JSONData) : JSONData;

  var CSV = '';

  //This condition will generate the Label/Header
  if (ShowLabel) {
    var row = "";

    //This loop will extract the label from 1st index of on array
    for (var index in arrData[0]) {

      //Now convert each value to string and comma-seprated
      row += index + ',';
    }

    row = row.slice(0, -1);

    //append Label row with line break
    CSV += row + '\r\n';
  }

  //1st loop is to extract each row
  for (var i = 0; i < arrData.length; i++) {
    var row = "";

    //2nd loop will extract each column and convert it in string comma-seprated
    for (var index in arrData[i]) {
      row += '"' + arrData[i][index] + '",';
    }

    row.slice(0, row.length - 1);

    //add a line break after each row
    CSV += row + '\r\n';
  }

  if (CSV == '') {
    alert("Invalid data");
    return;
  }

  //Generate a file name
  //this will remove the blank-spaces from the title and replace it with an underscore
  var fileName = ReportTitle.replace(/ /g,"_");

  //Initialize file format you want csv or xls
  var uri = 'data:text/csv;charset=iso-8859-1,' + escape(CSV);

  // Now the little tricky part.
  // you can use either>> window.open(uri);
  // but this will not work in some browsers
  // or you will not get the correct file extension

  //this trick will generate a temp <a /> tag
  var link = document.createElement("a");
  link.href = uri;

  //set the visibility hidden so it will not effect on your web-layout
  link.style = "visibility:hidden";
  link.download = fileName + ".csv";

  //this part will append the anchor tag and remove it after automatic click
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

},{}]},{},[4]);
