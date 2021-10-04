<?php
/**
 * Classe responsavel por importar e processar os casos em CSV (importador em massa)
 */
class Hacklab_CSV_Importer {
    
    /**
     * tipos validos para importação
     * 
     */
    var $types = array('text/x-comma-separated-values', 'text/comma-separated-values', 'application/octet-stream', 'application/vnd.ms-excel', 'application/x-csv', 'text/x-csv', 'text/csv', 'application/csv', 'application/excel', 'application/vnd.msexcel', 'text/plain');

    /**
     * Numero de casos cadastrados ou false em caso de erro
     */
    var $response = null;
    /**
     * 
     * Inicia a classe
     */
    public function __construct() {
        $this->include_files();
        
        add_action( 'admin_notices', array( $this, 'notices' ) );

    }
    /**
     * Inclui os arquivos PHP
     */
    private function include_files(){
        // inclui a página para upload do CSV
        require_once( STYLESHEETPATH . '/inc/csv-importer/class-settings-page.php' );
    }
    /**
     * Verifica se é um arquivo CSV
     */
    private function is_csv( $file ) {
        if ( ! isset( $file ) || ! is_array( $file ) ) {
            $this->response = 'Extensão de arquivo inválida. Selecione um arquivo CSV e tente novamente.';
            update_option( 'hacklab_csv_import_response', $this->response, false );
            return false;
        }
        if ( $file[ 'error' ] > 0 ) {
            $this->response = 'Extensão de arquivo inválida. Selecione um arquivo CSV e tente novamente.';
            update_option( 'hacklab_csv_import_response', $this->response, false );
            return false;
        }
        if( ! in_array( $file['type'], $this->types ) ){
            $this->response = 'Extensão de arquivo inválida. Selecione um arquivo CSV e tente novamente.';
            update_option( 'hacklab_csv_import_response', $this->response, false );
            return false;
        }
        return true;
    }
    /**
     * Callback da seleção de arquivo
     * Processa o arquivo csv e transforma em array
     */
    public function import_from_csv( $input ) {
        $file = $_FILES[ 'hacklab_csv_file'];
        if ( ! $this->is_csv( $_FILES[ 'hacklab_csv_file'] ) ) {
            return false;
        }
        //var_dump( file( $file[ 'tmp_name'] ) );

        $all_rows = array();
        $file_opened = fopen( $file[ 'tmp_name'], 'r' );
        $header = fgetcsv( $file_opened );
        $header[] = '_void';

        //var_dump( $header );
        while ( $row = fgetcsv( $file_opened ) ) {
            if ( count( $header ) > count( $row ) ) {
                $row[] = '';
            }
            $all_rows[] = array_combine($header, $row);
        }
        //print_r($all_rows);
        //var_dump( $all_rows );
        $this->response = $this->import_posts_from_array( $all_rows );
        update_option( 'hacklab_csv_import_response', $this->response, false );
    }
    /**
     * Importa os posts do array gerado na função import_from_csv()
     */
    private function import_posts_from_array( $posts ) {
        if ( ! is_array( $posts ) || empty( $posts ) ) {
            if ( ! isset( $file ) || ! is_array( $file ) ) {
                return 'Extensão de arquivo inválida. Selecione um arquivo CSV e tente novamente.';
            }    
        }
        $hour = date('H:m:s');

        $count = 0;
        foreach( $posts as $post ) {
            // Create post object

            $case = array(
                'post_title'    => '',
                'post_content'  => '',
                'post_status'   => 'publish',
                'post_type'     => 'case',
                'post_author'   => 1,
            );
            if ( isset( $post[ 'dia'] ) && isset( $post[ 'mes'] ) && isset( $post[ 'ano'] ) ) {
                $time_str = sprintf( '%s-%s-%s %s', $post[ 'ano'], $post[ 'mes'], $post[ 'dia'], $hour );
                $case[ 'post_date' ] = date( "Y-m-d H:i:s", strtotime( $time_str ) );
                
            }
            $meta_input = array();

            if ( isset( $post[ 'nome'] ) ) {
                $case[ 'post_title'] = wp_strip_all_tags( esc_textarea( utf8_encode( $post['nome'] ) ) );
            }
            if ( isset( $post[ 'descricao'] ) ) {
                $case[ 'post_content'] = wp_strip_all_tags( esc_textarea( utf8_encode( $post['descricao'] ) ) );
            }
            if ( empty( $case[ 'post_title' ] ) ) {
                $case[ 'post_title' ] = wp_strip_all_tags( esc_textarea( utf8_encode( $post['apelido'] ) ) );
            }
            
            foreach( $post as $key => $value ) {
                $meta_input[ utf8_encode( $key ) ] = utf8_encode( $value );
            }
            
            $case[ 'meta_input' ] = $meta_input;
            $post_id = wp_insert_post( $case, true );

            if ( ! $post_id || is_wp_error( $post_id ) ) {
                continue;
            }

            $meta_input = array();
            $geo = explode( ',', $post[ 'coordinates'] );
            if ( $geo && isset( $geo[0] ) && isset( $geo[ 1 ] ) ) {
                $geo[0] = floatval( $geo[0] );
                $geo[1] = floatval( $geo[1] );

                $meta_input[ 'geocode_latitude' ] = $geo[1];
                $meta_input[ 'geocode_longitude' ] = $geo[0];
                $meta_input[ '_geocode_lat_p' ] = $geo[1];
                $meta_input[ '_geocode_lon_p' ] = $geo[0];

                $meta_input[ '_related_point' ] = array(
                        'relevance'                 => 'primary',
                        '_geocode_lat'              => $geo[1],
                        '_geocode_lon'              => $geo[0],
                        '_geocode_city_level_1'     => $post[ 'municipio'],
                        '_geocode_city'             => $post[ 'municipio'],
                        '_geocode_region_level_3'   => 'Brasil',
                        '_geocode_region_level_2'   => $post[ 'uf' ],
                        '_geocode_region_level_1'   => $post[ 'municipio'],
                        '_geocode_country_code'     => 'BR',
                        '_geocode_country'          => 'Brasil',
                        '_geocode_full_address'     => $post[ 'municipio'] . ', ' . $post[ 'uf'] . ', Brasil',      
                );
                foreach ( $meta_input as $key => $value ) {
                    add_post_meta( $post_id, $key, $value, false );
                }
            }

            // importa termos da taxonomia tipos_de_violencia
            if ( isset( $post[ 'tipos_de_violencia'] ) && ! empty( $post[ 'tipos_de_violencia'] ) ) {
                $types = explode( ',', $post[ 'tipos_de_violencia'] );
                $terms = array();

                if ( $types && ! empty( $types ) ) {
                    foreach( $types as $term ) {
                        if ( $term_id = term_exists( $term, 'tipo_de_violncia') ) {
                            $terms[] = intval( $term_id[ 'term_id' ] );
                        } else {
                            $term_id = wp_insert_term(
                                $term,   // the term 
                                'tipo_de_violncia', // the taxonomy
                                array()
                            );
                            if ( $term_id && ! is_wp_error( $term_id ) ) {
                                $terms[] = intval( $term_id[ 'term_id' ] );
                            }
                        }
                    }
                    wp_set_object_terms( $post_id, $terms, 'tipo_de_violncia', true );
                }
            }

            //echo 'POST_Id:>:::';
            //var_dump( $post_id );
    
            //var_dump( utf8_encode( $post[ 'descricao'] ) );
            $count++;

        }
        return $count;
    }
    public function notices() {
        if ( $this->response ) {
            if ( is_numeric( $this->response ) && $this->response > 0 ) {
                printf( '% casos importados.', $response );
                return;
            }
            if ( is_string( $this->response ) ) {
                echo $this->response;
            }
        }
    }
}
$GLOBALS[ 'hacklab_csv' ] = new Hacklab_CSV_Importer();