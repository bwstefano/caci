!function a(b,c,d){function e(g,h){if(!c[g]){if(!b[g]){var i="function"==typeof require&&require;if(!h&&i)return i(g,!0);if(f)return f(g,!0);var j=new Error("Cannot find module '"+g+"'");throw j.code="MODULE_NOT_FOUND",j}var k=c[g]={exports:{}};b[g][0].call(k.exports,function(a){var c=b[g][1][a];return e(c?c:a)},k,k.exports,a,b,c,d)}return c[g].exports}for(var f="function"==typeof require&&require,g=0;g<d.length;g++)e(d[g]);return e}({1:[function(a,b,c){!function(a){b.exports=function(a){a.controller("MainCtrl",["$rootScope","$scope","$state","$timeout","Vindig",function(a,b,c,d,e){b.home=function(){"home"==c.current.name&&(b.initialized=!1)},b.init=function(){b.initialized=!0},"home.dossier"==c.current.name?b.isDossier=!0:b.isDossier=!1,a.$on("$stateChangeSuccess",function(a,c){"home"!==c.name&&(b.initialized=!0),"home.dossier"==c.name?b.isDossier=!0:b.isDossier=!1}),a.$on("$stateChangeStart",function(a,c){"home.dossier"==c.name?b.isDossier=!0:b.isDossier=!1}),b.$watch("isDossier",function(b){a.$broadcast("invalidateMap"),d(function(){a.$broadcast("invalidateMap")},1e3)}),e.cases().then(function(a){b.casos=a.data;for(var c=a.headers("X-WP-TotalPages"),d=2;c>=d;d++)e.cases({page:d}).then(function(a){b.casos=b.casos.concat(a.data)})})}]),a.controller("HomeCtrl",["$scope","Dossiers","Map",function(a,b,c){a.$on("$stateChangeSuccess",function(b,d){"home"==d.name&&(a.mapData=c)}),a.$on("dossierMap",function(b,c){a.mapData=c}),a.dossiers=b.data}]),a.controller("DossierCtrl",["$scope","$sce","Dossier","DossierMap",function(a,b,c,d){a.dossier=c.data,a.dossier.content=b.trustAsHtml(a.dossier.content),a.$emit("dossierMap",d)}])}}()},{}],2:[function(a,b,c){!function(a,c,d){c.mapbox.accessToken="pk.eyJ1IjoiaW5mb2FtYXpvbmlhIiwiYSI6InItajRmMGsifQ.JnRnLDiUXSEpgn7bPDzp7g",b.exports=function(a){a.directive("map",["$rootScope","Vindig",function(a,b){return{restrict:"E",scope:{mapData:"=",markers:"="},link:function(d,e,f){angular.element(e).append('<div id="'+f.id+'"></div>').attr("id","");var g=c.map(f.id,{center:[0,0],zoom:2,maxZoom:18});a.$on("invalidateMap",function(){setTimeout(function(){g.invalidateSize(!0)},5)}),d.mapData=!1;var h=!1;d.$watch("mapData",function(a,b){a.ID===b.ID&&h||(h=!0,d.layers=a.layers,setTimeout(function(){a.min_zoom&&(g.options.minZoom=parseInt(a.min_zoom)),a.max_zoom&&(g.options.maxZoom=parseInt(a.max_zoom)),a.pan_limits&&g.setMaxBounds(c.latLngBounds([a.pan_limits.south,a.pan_limits.west],[a.pan_limits.north,a.pan_limits.east])),g.setView(a.center),g.setZoom(a.zoom)},500))});var i=c.divIcon({className:"pin",iconSize:[18,18],iconAnchor:[9,18]}),j=c.markerClusterGroup({zIndex:10,maxClusterRadius:40,polygonOptions:{fillColor:"#000",color:"#000",opacity:.3,weight:2},spiderLegPolylineOptions:{weight:1,color:"#222",opacity:.4}});j.addTo(g);var k=[];d.$watch("markers",_.debounce(function(a){for(var b in k)j.removeLayer(k[b]);k=[];for(var b in a){var d=a[b];k[b]=c.marker([d.lat,d.lng],{icon:i})}for(var b in k)k[b].addTo(j)},300),!0),d.layers=[];var l=[],m=[],n=[],o={},p=c.control.layers({},{},{collapsed:!1,position:"bottomright"}).addTo(g);g.on("layeradd",function(a){a.layer._vindig_id&&o[a.layer._vindig_id].control&&g.addControl(o[a.layer._vindig_id].control)}),g.on("layerremove",function(a){a.layer._vindig_id&&o[a.layer._vindig_id].control&&g.removeControl(o[a.layer._vindig_id].control)}),d.$watch("layers",function(a,c){(a!==c||_.isEmpty(o))&&(c&&c.length&&(l.length&&(_.each(l,function(a){g.removeLayer(a.layer)}),l=[]),m.length&&(_.each(m,function(a){p.removeLayer(a.layer)}),m=[]),n.length&&(_.each(n,function(a){p.removeLayer(a.layer)}),n=[])),a&&a.length&&(_.each(a,function(a){a.ID=a.ID||"base",o[a.ID]&&"base"!=a.ID||(o[a.ID]=b.getLayer(a,g)),"fixed"!=a.filtering&&a.filtering?"swap"==a.filtering?m.push(o[a.ID]):"switch"==a.filtering&&n.push(o[a.ID]):l.push(o[a.ID])}),_.each(l,function(a){g.addLayer(a.layer)}),_.each(m,function(a){p.addBaseLayer(a.layer,a.name)}),_.each(n,function(a){p.addOverlay(a.layer,a.name)})))})}}}])}}(window.vindig,window.L)},{}],3:[function(a,b,c){!function(a){b.exports=function(a){a.filter("casoName",[function(){return function(a){var b="";return a&&(a.nome?(b+=a.nome,a.apelido&&(b+=" ("+a.apelido+")")):b+=a.apelido?a.apelido:"Não identificado"),b}}]),a.filter("casoDate",["$sce",function(a){return function(b){var c="";return b.ano&&(c='<span class="ano">'+b.ano+"</span>"),b.mes&&(c+='<span class="mes">/'+b.mes+"</span>"),b.dia&&(c+='<span class="dia">/'+b.dia+"</span>"),a.trustAsHtml(c)}}]),a.filter("caseLocation",["$sce",function(a){return function(b){var c="";return b.terra_indigena&&(c='<span class="ti">'+b.terra_indigena+"</span>"),b.municipio&&(c+='<span class="mun">'+b.municipio+"</span>"),b.uf&&(c+='<span class="uf">'+b.uf+"</span>"),a.trustAsHtml(c)}}]),a.filter("postToMarker",[function(){return _.memoize(function(a){if(a&&a.length){var b={};return _.each(a,function(a){a.coordinates&&(b[a.ID]={lat:a.coordinates[1],lng:a.coordinates[0],message:"<h2>"+a.title+"</h2>"})}),b}return{}},function(){return JSON.stringify(arguments)})}])}}()},{}],4:[function(a,b,c){!function(b,c,d){var e=b.module("vindigena",["ui.router"]);e.config(["$stateProvider","$urlRouterProvider","$locationProvider","$httpProvider",function(a,d,e,f){e.html5Mode({enabled:!1,requireBase:!1}),e.hashPrefix("!"),a.state("home",{url:"/",controller:"HomeCtrl",templateUrl:c.base+"/views/index.html",resolve:{Dossiers:["Vindig",function(a){return a.dossiers()}],Map:["$q","Vindig",function(a,b){var d=a.defer();return c.featured_map?b.getPost(c.featured_map).then(function(a){d.resolve(a.data)}):b.maps().then(function(a){d.resolve(a.data[0])}),d.promise}]}}),a.state("home.dossier",{url:"dossie/:id/",controller:"DossierCtrl",templateUrl:c.base+"/views/dossier.html",resolve:{Dossier:["$stateParams","Vindig",function(a,b){return b.getPost(a.id)}],DossierMap:["$q","Dossier","Vindig",function(a,b,d){var e=b.data.maps.length?b.data.maps[0]:c.featured_map,f=a.defer();return d.getPost(e).then(function(a){f.resolve(a.data)}),f.promise}]}}),d.rule(function(a,c){var d,e=c.path(),f=c.search();if("/"!==e[e.length-1])return 0===Object.keys(f).length?e+"/":(d=[],b.forEach(f,function(a,b){d.push(b+"="+a)}),e+"/?"+d.join("&"))})}]),a("./services")(e),a("./filters")(e),a("./directives")(e),a("./controllers")(e),b.element(document).ready(function(){b.bootstrap(document,["vindigena"])})}(window.angular,window.vindig)},{"./controllers":1,"./directives":2,"./filters":3,"./services":5}],5:[function(a,b,c){!function(a,c,d){b.exports=function(b){b.config(["$httpProvider",function(a){a.defaults.paramSerializer="$httpParamSerializerJQLike"}]),b.factory("Vindig",["$http",function(b){return{maps:function(c,d){return c=c||{},c=_.extend({type:"map"},c),d=d||{},d=_.extend({posts_per_page:50},d),c.filter=d,b({method:"GET",url:a.api+"/posts",params:c})},cases:function(c,d){return c=c||{},c=_.extend({type:"case"},c),d=d||{},d=_.extend({posts_per_page:80,without_map_query:1},d),c.filter=d,b({method:"GET",url:a.api+"/posts",params:c})},dossiers:function(c,d){return c=c||{},c=_.extend({type:"dossier"},c),d=d||{},d=_.extend({posts_per_page:50,without_map_query:1},d),c.filter=d,b({method:"GET",url:a.api+"/posts",params:c})},getLayer:function(a,b){var d={name:a.title||""};if("mapbox"==a.type){var e=c.mapbox.tileLayer(a.mapbox_id),f=c.mapbox.gridLayer(a.mapbox_id);d.layer=c.layerGroup([e,f]),d.control=c.mapbox.gridControl(f)}else"tilelayer"==a.type&&(d.layer=c.tileLayer(a.tile_url));return d.layer&&(d.layer._vindig_id=a.ID),d},getPost:function(c){return b.get(a.api+"/posts/"+c)}}}])}}(window.vindig,window.L)},{}]},{},[4]);
//# sourceMappingURL=app.js.map