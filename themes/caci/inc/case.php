<?php

/*
 * VINDIG Case
 */

class Vindig_Case {

    function __construct() {
        add_action('init', array($this, 'register_post_type'));
        // add_action('init', array($this, 'geocode'));
        // add_action('init', array($this, 'update_title'));
        add_filter('rest_prepare_case', array($this, 'json_prepare_post'), 10, 3);
        add_filter('acf/fields/relationship/result', array($this, 'relationship_result'), 10, 4);
        add_filter('posts_clauses', array($this, 'posts_clauses'), 10, 2);
        add_action('pre_get_posts', array($this, 'pre_get_posts'), 5);
        add_filter('json_serve_request', array($this, 'json_serve_request'), 20, 5);
    }

    function register_post_type() {

        $labels = array(
            'name' => __('Casos', 'vindig'),
            'singular_name' => __('Caso', 'vindig'),
            'add_new' => __('Adicionar caso', 'vindig'),
            'add_new_item' => __('Adicionar novo caso', 'vindig'),
            'edit_item' => __('Editar caso', 'vindig'),
            'new_item' => __('Novo caso', 'vindig'),
            'view_item' => __('Ver caso', 'vindig'),
            'search_items' => __('Buscar caso', 'vindig'),
            'not_found' => __('Nenhum caso encontrado', 'vindig'),
            'not_found_in_trash' => __('Nenhum caso encontrado no lixo', 'vindig'),
            'menu_name' => __('Casos', 'vindig')
        );

        $args = array(
            'labels' => $labels,
            'hierarchical' => false,
            'description' => __('Casos', 'vindig'),
            'supports' => array('title', 'revisions', 'custom-fields', 'editor'),
            'public' => true,
            'show_ui' => true,
            'show_in_menu' => true,
            'has_archive' => true,
            'menu_position' => 4,
            'rewrite' => false,
            'show_in_rest' => true,
        );

        register_post_type('case', $args);

        $case_post_metas = [
            "nome",
            "apelido",
            "idade",
            "descricao",
            "povo",
            "aldeia",
            "dia",
            "mes",
            "ano",
            "cod_ibge",
            "municipio",
            "uf",
            "relatorio",
            "cod_funai",
            "terra_indigena",
            "fonte_cimi",
        ];

        $default_meta_arg = [
            'show_in_rest' => true,
            'single' => true,
            'type' => 'string',
        ];

        foreach($case_post_metas as $meta_key) {
            register_post_meta( 'case', $meta_key, $default_meta_arg );
        }

        register_post_meta('case', '_related_point', [
			'show_in_rest'  => array(
					'schema' => array(
						'properties' => array(
							'_geocode_lat' => [
								'type' => 'float'
							],
							'_geocode_lon' => [
								'type' => 'float'
							],
							'_geocode_city_level_1' => [
								'type' => 'string'
							],
							'_geocode_city' => [
								'type' => 'string'
							],
							'_geocode_region_level_3' => [
								'type' => 'string'
							],
							'_geocode_region_level_2' => [
								'type' => 'string'
							],
							'_geocode_region_level_1' => [
								'type' => 'string'
							],
							'_geocode_country_code' => [
								'type' => 'string'
							],
							'_geocode_country' => [
								'type' => 'string'
							],
							'_geocode_full_address' => [
								'type' => 'string'
							],
							'relevance' => [
								'type' => 'string',
								'enum' => [
									'primary',
									'secondary'
								]
							],
						),
						'additionalProperties' => false,
					),
				),
			'single' => false,
			'sanitize_callback' => [$this, 'sanitize_points'],
			'auth_callback' => function() {
				return current_user_can('edit_posts');
			},
			'type' => 'object',
			'description' => __('Multiple metadata that holds locations related to the post. Each location is an object composed of lat, lon and geocode attributes', 'jeo')
		]);
    }

    function json_prepare_post($_post, $post, $context) {
        if ($post->post_type == 'case') 
            $_post->data['tipo_de_violencia'] = get_term($_post->data['tipo_de_violencia'][0])->name;
        
        return $_post;
    }

    function relationship_result($title, $post, $field, $the_post) {
        if ($post->post_type = 'case') {
            $title = $title . ' (' . get_post_meta($post->ID, 'municipio', true) . ' - ' . get_post_meta($post->ID, 'uf', true) . ')';
        }
        return $title;
    }

    function posts_clauses($clauses, $query) {
        global $wpdb, $wp;
        if ($query->is_search && ($query->get('post_type') == 'case' || $query->get('post_type') == array('case'))) {
            error_log('searching');
            $clauses['join'] .= " LEFT JOIN $wpdb->postmeta ON ($wpdb->posts.ID = $wpdb->postmeta.post_id) ";
            $like = '%' . $wpdb->esc_like($query->get('s')) . '%';
            $meta_like = str_replace(' ', '%', $like);
            $clauses['where'] = preg_replace(
                "/$wpdb->posts.post_title/",
                "$wpdb->postmeta.meta_value",
                $clauses['where']
            );
            $clauses['distinct'] = 'DISTINCT';
        }
        return $clauses;
    }

    function pre_get_posts($query) {
        if (isset($_REQUEST['csv'])) {
            $query->set('posts_per_page', -1);
        }
        if (!$query->is_search) {
            if ($query->get('post_type') == 'case' || $query->get('post_type') == array('case')) {
                $query->set('meta_key', 'nome');
                $query->set('orderby', 'meta_value');
                $query->set('order', 'ASC');
            }
        }
    }

    function json_serve_request($bool, $result, $path, $method, $json_server) {
        if (isset($_REQUEST['csv'])) {
            $this->outputCsv('casos.csv', $result->data);
            exit();
        }
    }

    public function outputCsv($fileName, $assocDataArray) {
        ob_clean();
        header('Pragma: public');
        header('Expires: 0');
        header('Cache-Control: must-revalidate, post-check=0, pre-check=0');
        header('Cache-Control: private', false);
        header('Content-Type: text/csv');
        header('Content-Disposition: attachment;filename=' . $fileName);
        if (isset($assocDataArray[0])) {
            $fp = fopen('php://output', 'w');
            fputcsv($fp, array_keys($assocDataArray[0]));
            foreach ($assocDataArray as $values) {
                foreach ($values as $key => $val) {
                    if (is_array($val) && !$this->isAssoc($val)) {
                        $values[$key] = implode(',', $val);
                    }
                }
                fputcsv($fp, $values);
            }
            fclose($fp);
        }
        ob_flush();
    }

    function isAssoc($arr) {
        return array_keys($arr) !== range(0, count($arr) - 1);
    }

    function geocode() {

        global $post;

        if (isset($_GET['geocode_cases'])) {

            $tis = json_decode(file_get_contents(STYLESHEETPATH . '/data/tis.json'), true);
            $municipios = json_decode(file_get_contents(STYLESHEETPATH . '/data/municipios.json'), true);

            $query = new WP_Query(array(
                'post_type' => 'case',
                'posts_per_page' => -1
            ));

            if ($query->have_posts()) {
                while ($query->have_posts()) {
                    $geocoded = false;
                    $method = 'none';
                    $query->the_post();
                    $funai = get_post_meta($post->ID, 'cod_funai', true);
                    $ibge = get_post_meta($post->ID, 'cod_ibge', true);
                    if ($funai) {
                        $method = 'ti';
                        foreach ($tis['rows'] as $ti) {
                            if ($ti['terrai_cod'] == $funai) {
                                update_post_meta($post->ID, 'geocode_latitude', $ti['lat']);
                                update_post_meta($post->ID, 'geocode_longitude', $ti['lon']);
                                $geocoded = true;
                            }
                        }
                    } elseif ($ibge) {
                        $method = 'mun';
                        foreach ($municipios['rows'] as $mun) {
                            if (intval($mun['co_ibge3']) == intval(substr($ibge, 0, -1))) {
                                update_post_meta($post->ID, 'geocode_latitude', $mun['lat']);
                                update_post_meta($post->ID, 'geocode_longitude', $mun['lon']);
                                $geocoded = true;
                            }
                        }
                    }
                    if (!$geocoded)
                        error_log('Could not geocode ' . $post->ID . ' through method "' . $method . '"');
                    wp_reset_postdata();
                }
            }

            error_log('done');
        }
    }

    function update_title() {


        if (isset($_GET['update_title'])) {
            error_log('init update title');

            global $post;

            $query = new WP_Query(array(
                'post_type' => 'case',
                'posts_per_page' => -1
            ));

            if ($query->have_posts()) {
                $count = 0;
                while ($query->have_posts()) {
                    $query->the_post();
                    $ano = get_post_meta($post->ID, 'ano', true);
                    // update only 2015 titles
                    if ($ano == '2015') {
                        $povo = get_post_meta($post->ID, 'povo', true);
                        $nome = get_post_meta($post->ID, 'nome', true);
                        $cod_funai = get_post_meta($post->ID, 'cod_funai', true);
                        $count++;

                        $title = $ano . ' - ' . $nome . ' ' . $povo . ' ' . $cod_funai;

                        wp_update_post(array(
                            'ID' => $post->ID,
                            'post_title' => $title
                        ));
                    }
                }
                error_log('updated ' . $count);
            }
        }
    }
}

new Vindig_Case();
