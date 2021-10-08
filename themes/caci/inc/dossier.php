<?php

/*
 * VINDIG Dossier
 */

class Vindig_Dossier {

  function __construct() {
    add_action('init', array($this, 'register_post_type'));
    add_filter('json_prepare_post', array($this, 'json_prepare_post'), 10, 3);
    add_action('init', array($this, 'register_fields'));
  }

  function register_post_type() {

    $labels = array(
      'name' => __('Dossiês', 'vindig'),
      'singular_name' => __('Dossiê', 'vindig'),
      'add_new' => __('Adicionar dossiê', 'vindig'),
      'add_new_item' => __('Adicionar novo dossiê', 'vindig'),
      'edit_item' => __('Editar dossiê', 'vindig'),
      'new_item' => __('Novo dossiê', 'vindig'),
      'view_item' => __('Ver dossiê', 'vindig'),
      'search_items' => __('Buscar dossiê', 'vindig'),
      'not_found' => __('Nenhum dossiê encontrado', 'vindig'),
      'not_found_in_trash' => __('Nenhum dossiê encontrado no lixo', 'vindig'),
      'menu_name' => __('Dossiês', 'vindig')
    );

    $args = array(
      'labels' => $labels,
      'hierarchical' => false,
      'description' => __('Dossiês', 'vindig'),
      'supports' => array('title', 'editor', 'excerpt', 'author', 'revisions', 'thumbnail', 'custom-fields'),
      'public' => true,
      'show_ui' => true,
      'show_in_menu' => true,
      'has_archive' => true,
      'menu_position' => 4,
      'rewrite' => false,
      'show_in_rest' => true,
    );

    register_post_type('dossier', $args);


    $default_meta_arg = [
        'show_in_rest' => true,
        'single' => true,
        'type' => 'string',
    ];

    register_post_meta( 'dossier', 'maps', [
        'show_in_rest' => true,
        'single' => false,
        'type' => 'string',
    ] );
    register_post_meta( 'dossier', 'uf', $default_meta_arg);
    register_post_meta( 'dossier', 'municipio', $default_meta_arg);
    register_post_meta( 'dossier', 'casos_query', $default_meta_arg);
    register_post_meta( 'dossier', 'casos', [
        'show_in_rest' => true,
        'single' => false,
        // 'type' => 'number',
    ] );
  }

  function register_fields() {

    if(function_exists("register_field_group")) {
      register_field_group(array (
        'id' => 'acf_casos',
        'title' => 'Casos',
        'fields' => array (
          array (
            'key' => 'field_5650f2e430101',
            'label' => 'Casos',
            'name' => 'casos',
            'type' => 'relationship',
            'instructions' => 'Casos relacionados ao dossiê',
            'return_format' => 'id',
            'post_type' => array(
              0 => 'case',
            ),
            'taxonomy' => array(
              0 => 'all',
            ),
            'filters' => array(
              0 => 'search',
            ),
            'result_elements' => array(
              0 => 'post_type',
              1 => 'post_title',
            ),
            'max' => '',
          ),
          array (
            'key' => 'uf',
            'label' => 'UF',
            'name' => 'uf',
            'type' => 'text',
          ),
          array (
            'key' => 'municipio',
            'label' => 'Município',
            'name' => 'municipio',
            'type' => 'text',
          ),
          array (
            'key' => 'field_casos_query',
            'label' => 'Casos relacionados por consulta',
            'name' => 'casos_query',
            'type' => 'textarea',
            'instructions' => 'Selecione casos através de consulta de metadados.
      <br/>Por ex: uf=Mato Grosso do Sul; povo=Guarani Kaiowá; ano=2013;

      <br/><br/>Se houver seleção de casos pelo método individual essa consulta não será utilizada.',
            'default_value' => '',
            'placeholder' => 'uf=Mato Grosso do Sul; povo=Guarani Kaiowá; ano=2013;',
            'maxlength' => '',
            'rows' => '',
            'formatting' => 'none',
          ),
        ),
        'location' => array(
          array (
            array (
              'param' => 'post_type',
              'operator' => '==',
              'value' => 'dossier',
              'order_no' => 0,
              'group_no' => 0,
            ),
          ),
        ),
        'options' => array(
          'position' => 'normal',
          'layout' => 'no_box',
          'hide_on_screen' => array(),
        ),
        'menu_order' => 0,
      ));
    }

  }

  function json_prepare_post($_post, $post, $context) {
    if($post['post_type'] == 'dossier') {
      $_post['casos'] = get_field('casos', $post['ID']);
      $_post['casos_query'] = htmlspecialchars_decode(get_field('casos_query', $post['ID']));
    }
    $_post['excerpt'] = $post['post_excerpt'];
    return $_post;
  }

}

new Vindig_Dossier();




add_action('add_meta_boxes', 'map_relation_add_meta_box');
add_action('save_post', 'map_relation_save_postdata');

function map_relation_add_meta_box() {
	$screens = ['dossier'];
    
	foreach($screens as $screen) {
		add_meta_box(
			'map_relation',
			__('Set maps for this post', 'jeo'),
			'map_relation_inner_custom_box',
			$screen,
			'advanced',
			'high'
		);
	}
}

function map_relation_inner_custom_box($post) {
	$post_maps = get_post_meta($post->ID, 'maps');
	if(!$post_maps)
		$post_maps = array();
	?>
	<div id="featured-metabox">
		<h4><?php _e('Select which maps this post belongs to. If you don\'t mark any they will appear in all maps.', 'jeo'); ?></h4>
		<?php $maps = get_posts(array('post_type' => 'map', 'posts_per_page' => -1)); ?>
		<?php if($maps) : ?>
			<ul>
				<?php foreach($maps as $map) : ?>
					<li><input type="checkbox" name="post_maps[]" value="<?php echo $map->ID; ?>" id="post_map_<?php echo $map->ID; ?>" <?php if(in_array($map->ID, $post_maps)) echo 'checked'; ?> /> <label for="post_map_<?php echo $map->ID; ?>"><?php echo $map->post_title; ?></li>
				<?php endforeach; ?>
			</ul>
		<?php else : ?>
			<p><?php _e('You haven\'t created any map, yet!', 'jeo'); ?></p>
		<?php endif; ?>
	</div>
	<?php
}

function map_relation_save_postdata($post_id) {
	if(defined('DOING_AUTOSAVE') && DOING_AUTOSAVE)
		return;

	if (defined('DOING_AJAX') && DOING_AJAX)
		return;

	if (false !== wp_is_post_revision($post_id))
		return;

	delete_post_meta($post_id, 'maps');
	if(isset($_POST['post_maps'])) {
		update_post_meta($post_id, 'has_maps', 1);
		foreach($_POST['post_maps'] as $map) {
			add_post_meta($post_id, 'maps', $map);
		}
	} else {
		delete_post_meta($post_id, 'has_maps');
	}

}