!function a(b,c,d){function e(g,h){if(!c[g]){if(!b[g]){var i="function"==typeof require&&require;if(!h&&i)return i(g,!0);if(f)return f(g,!0);var j=new Error("Cannot find module '"+g+"'");throw j.code="MODULE_NOT_FOUND",j}var k=c[g]={exports:{}};b[g][0].call(k.exports,function(a){var c=b[g][1][a];return e(c?c:a)},k,k.exports,a,b,c,d)}return c[g].exports}for(var f="function"==typeof require&&require,g=0;g<d.length;g++)e(d[g]);return e}({1:[function(a,b,c){!function(a){b.exports=function(a){a.controller("MainCtrl",["$rootScope","$scope","$state","$timeout","Vindig",function(a,b,c,d,e){e.pages().then(function(a){b.pages=a.data}),b.toggleNav=function(){b.showNav?b.showNav=!1:b.showNav=!0},a.$on("$stateChangeStart",function(){b.showNav=!1}),b.home=function(){"home"==c.current.name&&(b.initialized=!1)},b.init=function(){b.initialized=!0},"home.dossier"==c.current.name?b.isDossier=!0:b.isDossier=!1,"home.case"==c.current.name?b.isCase=!0:b.isCase=!1,a.$on("dossierCases",function(a,c){b.dossierCases=c}),a.$on("$stateChangeSuccess",function(c,d,e,f,g){"home"!==d.name&&(b.initialized=!0),"home.case"==f.name&&a.$broadcast("invalidateMap")}),a.$on("$stateChangeStart",function(a,c){b.dossierCases=!1,"home.dossier"==c.name?b.isDossier=!0:b.isDossier=!1,"home.case"==c.name?b.isCase=!0:b.isCase=!1}),b.$watch("isDossier",function(b,c){b!==c&&a.$broadcast("invalidateMap")}),e.cases().then(function(a){b.casos=a.data;for(var c=a.headers("X-WP-TotalPages"),d=2;c>=d;d++)e.cases({page:d}).then(function(a){b.casos=b.casos.concat(a.data)})});var f;b.filter={text:"",date:{min:0,max:0}},b.dateFilters=[],b.dropdownFilters={},b.$watch("casos",function(a){var c=_.sortBy(e.getUniq(a,"ano"),function(a){return parseInt(a)});b.dateFilters=[parseInt(_.min(c)),parseInt(_.max(c))],b.filter.date.min=parseInt(_.min(c)),b.filter.date.max=parseInt(_.max(c)),b.dropdownFilters.uf=_.sortBy(e.getUniq(a,"uf"),function(a){return a}),b.dropdownFilters.relatorio=_.sortBy(e.getUniq(a,"relatorio"),function(a){return a}),b.dropdownFilters.povo=_.sortBy(e.getUniq(a,"povo"),function(a){return a})}),b.clearFilters=function(){b.filter.text="",b.filter.date.min=parseInt(_.min(f)),b.filter.date.max=parseInt(_.max(f)),b.filter.strict={}},b.$on("$stateChangeSuccess",function(a,c){"home.dossier"==c.name&&b.clearFilters()}),b.focusMap=function(b){a.$broadcast("focusMap",b.coordinates)}}]),a.controller("HomeCtrl",["$scope","Dossiers","Map",function(a,b,c){a.$on("$stateChangeSuccess",function(b,d){("home"==d.name||"home.case"==d.name||"home.page"==d.name)&&(a.mapData=c)}),a.$on("dossierMap",function(b,c){a.mapData=c}),a.dossiers=b.data}]),a.controller("DossierCtrl",["$rootScope","$timeout","$scope","$sce","Dossier","DossierMap",function(a,b,c,d,e,f){c.dossier=e.data,c.dossier.content=d.trustAsHtml(c.dossier.content),c.$emit("dossierMap",f),b(function(){a.$broadcast("invalidateMap")},300),a.$broadcast("dossierCases",c.dossier.casos)}]),a.controller("CaseCtrl",["$rootScope","$stateParams","$scope","$sce","Case",function(a,b,c,d,e){c.caso=e.data,c.caso.content=d.trustAsHtml(c.caso.content),0!=b.focus&&a.$broadcast("focusMap",c.caso.coordinates),a.$broadcast("invalidateMap")}]),a.controller("PageCtrl",["$scope","$sce","Page",function(a,b,c){a.page=c.data,a.page.content=b.trustAsHtml(a.page.content)}])}}()},{}],2:[function(a,b,c){!function(a,c,d,e){d.mapbox.accessToken="pk.eyJ1IjoiaW5mb2FtYXpvbmlhIiwiYSI6InItajRmMGsifQ.JnRnLDiUXSEpgn7bPDzp7g",b.exports=function(a){a.directive("forceOnclick",[function(){return{restrict:"A",scope:{forceOnclick:"=",forceParent:"@"},link:function(a,b,d){var e,f=a.forceOnclick||500;e=c(a.forceParent?"#"+a.forceParent:b),c(b).on("click",function(){e.addClass("force"),setTimeout(function(){e.removeClass("force")},f)})}}}]),a.directive("map",["$rootScope","$state","Vindig",function(a,b,c){return{restrict:"E",scope:{mapData:"=",markers:"="},link:function(e,f,g){angular.element(f).append('<div id="'+g.id+'"></div>').attr("id","");var h=d.map(g.id,{center:[0,0],zoom:2,maxZoom:18});a.$on("invalidateMap",function(){setTimeout(function(){h.invalidateSize(!0)},15)});var i;a.$on("focusMap",function(a,b){i=b,h.fitBounds(d.latLngBounds([[b[1],b[0]]]))}),e.mapData=!1;var j=!1;e.$watch("mapData",function(a,b){a.ID===b.ID&&j||(j=!0,e.layers=a.layers,setTimeout(function(){a.min_zoom&&(h.options.minZoom=parseInt(a.min_zoom)),a.max_zoom&&(h.options.maxZoom=parseInt(a.max_zoom)),a.pan_limits&&h.setMaxBounds(d.latLngBounds([a.pan_limits.south,a.pan_limits.west],[a.pan_limits.north,a.pan_limits.east])),i?(h.fitBounds(d.latLngBounds([[i[1],i[0]]])),i=!1):(h.setView(a.center),h.setZoom(a.zoom))},500))});var k=d.divIcon({className:"pin",iconSize:[18,18],iconAnchor:[9,18],popupAnchor:[0,-18]}),l=d.markerClusterGroup({zIndex:100,maxClusterRadius:40,polygonOptions:{fillColor:"#000",color:"#000",opacity:.3,weight:2},spiderLegPolylineOptions:{weight:1,color:"#222",opacity:.4}});l.addTo(h);var m=[];e.$watch("markers",_.debounce(function(a){for(var c in m)l.removeLayer(m[c]);m=[];for(var c in a){var e=a[c];m[c]=d.marker([e.lat,e.lng],{icon:k}),m[c].post=e,m[c].bindPopup(e.message),m[c].on("mouseover",function(a){a.target.openPopup()}),m[c].on("mouseout",function(a){a.target.closePopup()}),m[c].on("click",function(a){var c=_.extend({focus:!1},a.target.post.state.params);b.go(a.target.post.state.name,c)})}for(var c in m)m[c].addTo(l)},300),!0),e.layers=[];var n=[],o=[],p=[],q={},r=d.control.layers({},{},{collapsed:!1,position:"bottomright",autoZIndex:!1}).addTo(h);h.on("layeradd",function(a){a.layer._vindig_id&&q[a.layer._vindig_id].control&&h.addControl(q[a.layer._vindig_id].control)}),h.on("layerremove",function(a){a.layer._vindig_id&&q[a.layer._vindig_id].control&&h.removeControl(q[a.layer._vindig_id].control)}),e.$watch("layers",function(a,b){(a!==b||_.isEmpty(q))&&(b&&b.length&&(n.length&&(_.each(n,function(a){h.removeLayer(a.layer)}),n=[]),o.length&&(_.each(o,function(a){r.removeLayer(a.layer)}),o=[]),p.length&&(_.each(p,function(a){r.removeLayer(a.layer)}),p=[])),a&&a.length&&(_.each(a,function(a,b){a.zIndex=b+10,a.ID=a.ID||"base",q[a.ID]&&"base"!=a.ID||(q[a.ID]=c.getLayer(a,h)),"fixed"!=a.filtering&&a.filtering?"swap"==a.filtering?o.push(q[a.ID]):"switch"==a.filtering&&p.push(q[a.ID]):n.push(q[a.ID])}),_.each(n,function(a){h.addLayer(a.layer)}),_.each(o,function(a){r.addBaseLayer(a.layer,a.name)}),_.each(p,function(a){r.addOverlay(a.layer,a.name)})))})}}}])}}(window.vindig,window.jQuery,window.L)},{}],3:[function(a,b,c){!function(a,c){b.exports=function(b){b.filter("exact",function(){return function(a,b){var c,d=[],e=!0;return angular.forEach(b,function(a,b){e=e&&!a}),e?a:(angular.forEach(a,function(a){c=!0,angular.forEach(b,function(b,d){b&&(c=c&&a[d]===b)}),c&&d.push(a)}),d)}}),b.filter("caseIds",function(){return function(b,c){return c&&c.length&&(b=a.filter(b,function(a){return-1!=c.indexOf(a.ID)})),b}}),b.filter("casoName",[function(){return function(a){var b="";return a&&(a.nome?(b+=a.nome,a.apelido&&(b+=" ("+a.apelido+")")):b+=a.apelido?a.apelido:"Não identificado"),b}}]),b.filter("casoDate",["$sce",function(a){return function(b){var c="";return b.ano&&(c='<span class="ano">'+b.ano+"</span>"),b.mes&&(c+='<span class="mes">/'+b.mes+"</span>"),b.dia&&(c+='<span class="dia">/'+b.dia+"</span>"),a.trustAsHtml(c)}}]),b.filter("caseLocation",["$sce",function(a){return function(b){var c="";return b.terra_indigena&&(c='<span class="ti">'+b.terra_indigena+"</span>"),b.municipio&&(c+='<span class="mun">'+b.municipio+"</span>"),b.uf&&(c+='<span class="uf">'+b.uf+"</span>"),a.trustAsHtml(c)}}]),b.filter("dateFilter",[function(){return function(b,c){return b&&b.length&&(b=a.filter(b,function(a){var b=parseInt(a.ano);return b>=c.min&&b<=c.max})),b}}]),b.filter("postToMarker",["casoNameFilter",function(b){return a.memoize(function(c){if(c&&c.length){var d={};return a.each(c,function(a){a.coordinates&&(d[a.ID]={lat:a.coordinates[1],lng:a.coordinates[0],message:"<h2>"+b(a)+"</h2>",state:{name:"home."+a.type,params:{id:a.ID}}})}),d}return{}},function(){return JSON.stringify(arguments)})}])}}(window._)},{}],4:[function(a,b,c){!function(b,c,d){var e=b.module("vindigena",["ui.router","ui-rangeSlider","fitVids"]);e.config(["$stateProvider","$urlRouterProvider","$locationProvider","$httpProvider",function(a,d,e,f){e.html5Mode({enabled:!1,requireBase:!1}),e.hashPrefix("!"),a.state("home",{url:"/",controller:"HomeCtrl",templateUrl:c.base+"/views/index.html",resolve:{Dossiers:["Vindig",function(a){return a.dossiers()}],Map:["$q","Vindig",function(a,b){var d=a.defer();return c.featured_map?b.getPost(c.featured_map).then(function(a){d.resolve(a.data)}):b.maps().then(function(a){d.resolve(a.data[0])}),d.promise}]}}).state("home.page",{url:"p/:id/",controller:"PageCtrl",templateUrl:c.base+"/views/page.html",resolve:{Page:["$stateParams","Vindig",function(a,b){return b.getPost(a.id)}]}}).state("home.case",{url:"caso/:id/",controller:"CaseCtrl",templateUrl:c.base+"/views/case.html",params:{focus:!0},resolve:{Case:["$stateParams","Vindig",function(a,b){return b.getPost(a.id)}]}}).state("home.dossier",{url:"dossie/:id/",controller:"DossierCtrl",templateUrl:c.base+"/views/dossier.html",resolve:{Dossier:["$stateParams","Vindig",function(a,b){return b.getPost(a.id)}],DossierMap:["$q","Dossier","Vindig",function(a,b,d){var e=b.data.maps.length?b.data.maps[0]:c.featured_map,f=a.defer();return d.getPost(e).then(function(a){f.resolve(a.data)}),f.promise}]}}),d.rule(function(a,c){var d,e=c.path(),f=c.search();if("/"!==e[e.length-1])return 0===Object.keys(f).length?e+"/":(d=[],b.forEach(f,function(a,b){d.push(b+"="+a)}),e+"/?"+d.join("&"))})}]),a("./services")(e),a("./filters")(e),a("./directives")(e),a("./controllers")(e),b.element(document).ready(function(){b.bootstrap(document,["vindigena"])})}(window.angular,window.vindig)},{"./controllers":1,"./directives":2,"./filters":3,"./services":5}],5:[function(a,b,c){!function(a,c,d){b.exports=function(b){b.config(["$httpProvider",function(a){a.defaults.paramSerializer="$httpParamSerializerJQLike"}]),b.factory("Vindig",["$http",function(b){return{pages:function(c,d){return c=c||{},c=_.extend({type:"page"},c),d=d||{},d=_.extend({posts_per_page:50},d),c.filter=d,b({method:"GET",url:a.api+"/posts",params:c})},maps:function(c,d){return c=c||{},c=_.extend({type:"map"},c),d=d||{},d=_.extend({posts_per_page:50},d),c.filter=d,b({method:"GET",url:a.api+"/posts",params:c})},cases:function(c,d){return c=c||{},c=_.extend({type:"case"},c),d=d||{},d=_.extend({posts_per_page:80,without_map_query:1},d),c.filter=d,b({method:"GET",url:a.api+"/posts",params:c})},dossiers:function(c,d){return c=c||{},c=_.extend({type:"dossier"},c),d=d||{},d=_.extend({posts_per_page:50,without_map_query:1},d),c.filter=d,b({method:"GET",url:a.api+"/posts",params:c})},getLayer:function(a,b){var d={name:a.title||""};if("mapbox"==a.type){var e=c.mapbox.tileLayer(a.mapbox_id),f=c.mapbox.gridLayer(a.mapbox_id);d.layer=c.layerGroup([e,f]),d.control=c.mapbox.gridControl(f)}else"tilelayer"==a.type&&(d.layer=c.tileLayer(a.tile_url));return d.layer&&(a.zIndex&&d.layer.setZIndex(a.zIndex),d.layer._vindig_id=a.ID),d},getPost:function(c){return b.get(a.api+"/posts/"+c)},getUniq:function(a,b,c){var d=[];if(_.each(a,function(a){a[b]&&(angular.isArray(a[b])?a[b].length&&(d=d.concat(a[b])):d.push(a[b]))}),d.length){var e=_.uniq(d,function(a,b){return"undefined"!=typeof c&&a[c]?a[c]:a});return _.compact(e)}return[]}}}])}}(window.vindig,window.L)},{}]},{},[4]);
//# sourceMappingURL=app.js.map