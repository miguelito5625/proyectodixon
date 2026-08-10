const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

// These should match the environment variables used in Angular
// Since this is a local script, we can hardcode the URL and Key for this project
const supabaseUrl = 'https://ssfwmtjftfwlsfvdvzex.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNzZndtdGpmdGZ3bHNmdmR2emV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYyNDE3MTMsImV4cCI6MjEwMTgxNzcxM30.yFF6VZC7UCZTpi9FgCPHw-C2hVtRzxzSObW8GRpQ8lQ';
const supabase = createClient(supabaseUrl, supabaseKey);

async function seedDatabase() {
    try {
        const rawData = fs.readFileSync('./db_seed.json', 'utf8');
        const seed = JSON.parse(rawData);

        console.log("Iniciando carga a Supabase...");

        // Insert Proyectos
        for (const p of seed.proyectos) {
            const { error } = await supabase.from('proyectos').insert({
                id: p.id,
                nombre: p.nombre,
                ahj: p.ahj,
                general_contractor: p.general_contractor,
                subcontratista_pci: p.subcontratista_pci,
                permiso_padre: p.permiso_padre
            }).select();
            if (error && error.code !== '23505') {
                console.error('Error insertando proyecto:', error);
            }
        }
        console.log("Proyectos insertados:", seed.proyectos.length);

        // Insert Zonas
        for (const zona of seed.zonas) {
            const { error } = await supabase.from('zonas').insert({
                id: zona.id,
                proyecto_id: zona.proyecto_id,
                nivel: zona.nivel,
                numero_zona: zona.numero_zona
            }).select();
            if (error && error.code !== '23505') { // Ignore unique violation if rerunning
                console.error('Error insertando zona:', error);
            }
        }
        console.log("Zonas insertadas:", seed.zonas.length);

        // Insert Lineas
        for (const linea of seed.lineas) {
            const { error } = await supabase.from('lineas').insert({
                id: linea.id,
                zona_id: linea.zona_id,
                tipo: linea.tipo,
                permiso_especifico: linea.permiso_especifico || null,
                avance_fisico: linea.avance_fisico,
                porcentaje_completado: linea.porcentaje_completado,
                notas: linea.notas || null
            }).select();
            if (error && error.code !== '23505') {
                console.error('Error insertando linea:', error);
            }
        }
        console.log("Lineas insertadas:", seed.lineas.length);

        // Insert Inspecciones
        let insCount = 0;
        for (const insp of seed.inspecciones) {
            const { error } = await supabase.from('inspecciones').insert({
                id: insp.id,
                linea_id: insp.linea_id,
                tipo_prueba: insp.tipo_prueba,
                estado: insp.estado,
                fecha_inspeccion: insp.fecha_inspeccion || null
            }).select();
            if (error && error.code !== '23505') {
                console.error('Error insertando inspeccion:', error);
            }
            insCount++;
        }
        console.log("Inspecciones insertadas:", insCount);

        console.log("¡Carga exitosa!");
    } catch (e) {
        console.error("Error durante el seed:", e);
    }
}

seedDatabase();
