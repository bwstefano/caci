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
                                ", </span>";
                        else
                            location =
                                '<span class="ti">' +
                                data.terra_indigena +
                                ", </span>";
                    }
                    if (data.municipio) {
                        if (showLabels)
                            location +=
                                '<span class="mun"><span class="label">Município</span> ' +
                                data.municipio +
                                " - </span>";
                        else
                            location +=
                                '<span class="mun"> ' +
                                data.municipio +
                                " - </span>";
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
