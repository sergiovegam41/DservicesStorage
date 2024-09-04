class Utils {
    
    static isNumeric(valor) {
        return /^-?\d+(\.\d+)?$/.test(valor);
    }

    static obtenerExtension(nombreArchivo) {
        // Divide el nombre del archivo desde el último punto
        const partes = nombreArchivo.split('.');
        // Devuelve la última parte como la extensión
        return partes.length > 1 ? partes[partes.length - 1] : '';
    }
}

export default Utils 