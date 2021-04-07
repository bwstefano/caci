<?php

/*
 * ACF
 */

if (!class_exists('Acf')) {

    function vindig_acf_settings_path($path) {
        $path = get_stylesheet_directory() . '/inc/acf/';
        return $path;
    }
    add_filter('acf/helpers/get_path', 'vindig_acf_settings_path');

    function vindig_acf_settings_dir($dir) {
        // update path
        $dir = get_stylesheet_directory_uri() . '/inc/acf/';
        // return
        return $dir;
    }
    add_filter('acf/helpers/get_dir', 'vindig_acf_settings_dir');

    define('ACF_LITE', true);

    require_once(STYLESHEETPATH . '/inc/acf/acf.php');
}

/*
 * Set ga
 */
function vindig_ga() {
?>
    <script>
        var _gaq = _gaq || [];
        _gaq.push(['_setAccount', "UA-85532850-1"]);
        _gaq.push(['_setDomainName', 'caci.rosaluxspba.org']);
        (function() {
            var ga = document.createElement('script');
            ga.type = 'text/javascript';
            ga.async = true;
            ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
            var s = document.getElementsByTagName('script')[0];
            s.parentNode.insertBefore(ga, s);
        })();
    </script>
<?php
}
add_action('wp_head', 'vindig_ga');

/*
 * Theme WP features
 */
add_theme_support('post-thumbnails');

/*
 * Scripts and styles
 */

// remove jeo frontend
function vindig_init() {
    global $jeo, $jeo_markers;
    remove_action('wp_head', array($jeo, 'scripts'), 2);
    remove_action('wp_footer', array($jeo_markers, 'enqueue_scripts'));
    remove_action('wp_enqueue_scripts', 'jeo_theme_scripts', 5);
    remove_action('wp_enqueue_scripts', 'jeo_enqueue_theme_scripts', 12);
}
add_action('jeo_init', 'vindig_init');

function vindig_scripts() {

    wp_register_script('angular', get_stylesheet_directory_uri() . '/static/angular/angular.min.js');
    wp_register_script('angular-ui-router', get_stylesheet_directory_uri() . '/static/ui-router/release/angular-ui-router.js', array('angular'));
    wp_register_script('angular-cookies', get_stylesheet_directory_uri() . '/static/angular-cookies/angular-cookies.min.js', array('angular'));

    wp_register_script('twttr', 'http://platform.twitter.com/widgets.js');
    wp_register_script('angular-socialshare', get_stylesheet_directory_uri() . '/static/angular-socialshare/angular-socialshare.min.js', array('angular', 'twttr'));
    wp_register_style('angular-socialshare', get_stylesheet_directory_uri() . '/static/angular-socialshare/angular-socialshare.min.css');

    wp_register_script('angular-rangeslider', get_stylesheet_directory_uri() . '/static/angular-rangeslider/angular.rangeSlider.js', array('angular'));
    wp_register_style('angular-rangeslider', get_stylesheet_directory_uri() . '/static/angular-rangeslider/angular.rangeSlider.css');

    wp_register_script('angular-fitvids', get_stylesheet_directory_uri() . '/static/angular-fitvids/angular-fitvids.js', array('angular'));

    wp_register_script('leaflet', get_stylesheet_directory_uri() . '/static/leaflet/dist/leaflet.js');
    wp_register_style('leaflet', get_stylesheet_directory_uri() . '/static/leaflet/dist/leaflet.css');

    wp_register_script('leaflet.markerclusterer', get_stylesheet_directory_uri() . '/static/leaflet.markerclusterer/dist/leaflet.markercluster.js', array('leaflet'));
    wp_register_style('leaflet.markerclusterer', get_stylesheet_directory_uri() . '/static/leaflet.markerclusterer/dist/MarkerCluster.Default.css');
    wp_register_script('leaflet.fullscreen', get_stylesheet_directory_uri() . '/static/leaflet.fullscreen/Control.FullScreen.js', array('leaflet'));
    wp_register_style('leaflet.fullscreen', get_stylesheet_directory_uri() . '/static/leaflet.fullscreen/Control.FullScreen.css');

    wp_register_script('leaflet.heat', get_stylesheet_directory_uri() . '/js/leaflet-heat.js', array('leaflet'));

    wp_register_script('mapbox.standalone', get_stylesheet_directory_uri() . '/static/mapbox.js/mapbox.standalone.js');
    wp_register_style('mapbox.standalone', get_stylesheet_directory_uri() . '/static/mapbox.js/mapbox.standalone.css');

    wp_register_style('normalize', get_stylesheet_directory_uri() . '/static/normalize.css/normalize.css');

    wp_register_style('icons', get_stylesheet_directory_uri() . '/css/icons.css');

    wp_enqueue_script('app', get_stylesheet_directory_uri() . '/js/app.js', array('jquery', 'underscore', 'angular', 'angular-ui-router', 'angular-cookies', 'angular-socialshare', 'angular-rangeslider', 'angular-fitvids', 'leaflet', 'mapbox.standalone', 'leaflet.fullscreen', 'leaflet.markerclusterer', 'leaflet.heat'), '1.1.4');

    wp_enqueue_style('webfonts', 'https://fonts.googleapis.com/css?family=PT+Serif:400,700|Hind+Siliguri:300,400,500,600,700|Megrim:400');

    wp_enqueue_style('app', get_stylesheet_directory_uri() . '/css/app.css', array('normalize', 'angular-socialshare', 'angular-rangeslider', 'mapbox.standalone', 'leaflet.fullscreen', 'leaflet.markerclusterer', 'icons'), '1.1.5');
    wp_enqueue_style('print', get_stylesheet_directory_uri() . '/css/print.css', array('app'), '1.1', 'print');

    // $jeo_options = jeo_get_options();
    // $front_page_map = 0;
    // if($jeo_options['front_page'] && $jeo_options['front_page']['featured_map']) {
    //   $front_page_map = $jeo_options['front_page']['featured_map'];
    // }

    wp_localize_script('app', 'vindig', array(
        'base' => get_stylesheet_directory_uri(),
        'api' => esc_url(get_rest_url(null, '/wp/v2')),
        // 'api' => esc_url(get_json_url()),
        
        'featured_map' => (int) pods_field_display('configuracoes_tema', null, 'mapa_em_destaque')
    ));
}
add_action('wp_enqueue_scripts', 'vindig_scripts');

/*
 * Required plugins
 */
require_once(STYLESHEETPATH . '/inc/class-tgm-plugin-activation.php');

function vindig_register_required_plugins() {

    $plugins = array(
        array(
            'name' => 'JSON REST API (WP API)',
            'slug' => 'json-rest-api',
            'required' => true,
            'force_activation' => true
        )
    );

    $options = array(
        'default_path'  => '',
        'menu'      => 'vindig-install-plugins',
        'has_notices'  => true,
        'dismissable'  => true,
        'dismiss_msg'  => '',
        'is_automatic'  => false,
        'message'    => ''
    );

    tgmpa($plugins, $options);
}
add_action('tgmpa_register', 'vindig_register_required_plugins');

/*
 * Set API route
 */
function vindig_json_url_prefix() {
    return 'api';
}
add_filter('json_url_prefix', 'vindig_json_url_prefix');

add_filter('show_admin_bar', '__return_false');

require_once(STYLESHEETPATH . '/inc/dossier.php');
require_once(STYLESHEETPATH . '/inc/case.php');
require_once(STYLESHEETPATH . '/inc/denuncia.php');
require_once(STYLESHEETPATH . '/inc/contact.php');
require_once(STYLESHEETPATH . '/inc/shortcodes.php');

/* Migrate Geolocation meta */
if(!get_option('migrated-geolocation-meta')){
	add_option('migrated-geolocation-meta', 1);
	
	$query = new WP_Query([
		'posts_per_page' => -1,
		'suppress_filters' => true,
        'post_type' => 'case',
		'meta_query' => array(
			array(
					'key' => 'geocode_latitude',
				'value'   => array(''),
				'compare' => 'NOT IN'
			),
	    ),

	]);

	while ( $query->have_posts() ) {
		$query->the_post();

		$source_lat = get_post_meta(get_the_ID(), 'geocode_latitude', true);
		$source_lon = get_post_meta(get_the_ID(), 'geocode_longitude', true);
		$source_geocode = get_post_meta(get_the_ID(), 'geocode_address', true);

		// Build "_related_point" object
		$related_point = array(
			'_geocode_lat' => $source_lat,
			'_geocode_lon' => $source_lon,
			'relevance' => 'primary',
			'_geocode_full_address' => $source_geocode

		);

		update_post_meta( get_the_ID(), '_related_point', $related_point );
	}
}


if(!function_exists('legacy_layer_data')){
    function legacy_layer_data($response, $post) {
        $response->data['layers'] = '';
        $layers = get_post_meta( $post->ID, 'layers', true );

        $type_equivalence = [
                    'fixed'=> 'fixed',
                    'switchable' => 'switch',
                    'swappable' => 'swap'
        ];

        $legacy_layers = [];

        if($layers && sizeof($layers)) {
            foreach($layers as $index => $map_layer) {
                $base_object = [
                    "ID" => $map_layer["id"],
                    "title" => get_the_title($map_layer["id"]),
                    "type" => get_post_meta($map_layer["id"], "type", true),
                    "filtering" => $type_equivalence[$map_layer["use"]],
                ];

                if(!in_array($base_object["type"], ['mapbox-tileset-raster', 'tilelayer'])) continue;
                
                switch($base_object["type"]) {
                    case 'tilelayer':
                        $base_object = array_merge($base_object, [ 'tile_url' => get_post_meta($map_layer["id"], "layer_type_options", true)["url"] ]);
                        // $baseObject = [ ...$baseObject, 'tile_url' => layer.meta.layer_type_options.url ];
                        break;
                    case 'mapbox-tileset-raster':
                        $base_object = array_merge($base_object, [ 'type' => 'mapbox', 'mapbox_id' => get_post_meta($map_layer["id"], "layer_type_options", true)["tileset_id"]] );;
                        break;
                }

                // return $map_layer;

        
                switch($map_layer['use']) {
                    case 'switchable':
                        $base_object = array_merge($base_object, [ "hidden" => !$map_layer['default'] ]);
                        break;
                    case 'swappable':
                        $base_object = array_merge($base_object, ["first_swap" => $map_layer['default']? "on" : false ]);
                        break;
                    case 'fixed':
                        $base_object = $base_object;
                        break;
                }

                
                $legacy_layers[] = $base_object;            
                // return ;
            }
            
            $response->data['layers'] = $legacy_layers;

        }
        
        return $response;
    }
}

add_filter('rest_prepare_map', 'legacy_layer_data', 10, 3);

function add_case_post_type($default) {
    return array_merge($default, [ 'case' ]);
}

add_filter('jeo_enabled_post_types', 'add_case_post_type', 10, 1);

//var_dump(pods_field_display('configuracoes_tema', null, 'mapa_em_destaque'));
// die();