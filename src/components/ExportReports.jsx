import React, { useState } from "react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import "./ExportReports.css";

const ExportReports = ({ matches, teamName }) => {
  const [exporting, setExporting] = useState(false);

  // Calcular estadísticas generales
  const getTeamStats = () => {
    const playerStats = {};

    matches.forEach((match) => {
      match.players.forEach((player) => {
        if (!playerStats[player.name]) {
          playerStats[player.name] = {
            gamesPlayed: 0,
            points: 0,
            minutes: 0,
            freeThrows: { made: 0, attempted: 0 },
            twoPointers: { made: 0, attempted: 0 },
            threePointers: { made: 0, attempted: 0 },
            plusMinus: 0,
          };
        }

        const stats = playerStats[player.name];
        stats.gamesPlayed += 1;
        stats.points += player.data?.score || 0;
        stats.minutes += player.timePlayed || 0;
        stats.freeThrows.made += player.data?.shotsOfOneSuccessful || 0;
        stats.freeThrows.attempted += player.data?.shotsOfOneAttempted || 0;
        stats.twoPointers.made += player.data?.shootingOfTwoSuccessfulPoint?.length || 0;
        stats.twoPointers.attempted += player.data?.shotsOfTwoAttempted || 0;
        stats.threePointers.made += player.data?.shootingOfThreeSuccessfulPoint?.length || 0;
        stats.threePointers.attempted += player.data?.shotsOfThreeAttempted || 0;
        stats.plusMinus += player.inOut || 0;
      });
    });

    return Object.entries(playerStats).map(([name, stats]) => ({
      name,
      gamesPlayed: stats.gamesPlayed,
      avgPoints: (stats.points / stats.gamesPlayed).toFixed(1),
      avgMinutes: (stats.minutes / stats.gamesPlayed).toFixed(1),
      tlPercent: stats.freeThrows.attempted > 0 
        ? ((stats.freeThrows.made / stats.freeThrows.attempted) * 100).toFixed(1) + '%'
        : '0%',
      t2Percent: stats.twoPointers.attempted > 0
        ? ((stats.twoPointers.made / stats.twoPointers.attempted) * 100).toFixed(1) + '%'
        : '0%',
      t3Percent: stats.threePointers.attempted > 0
        ? ((stats.threePointers.made / stats.threePointers.attempted) * 100).toFixed(1) + '%'
        : '0%',
      avgPlusMinus: (stats.plusMinus / stats.gamesPlayed).toFixed(1),
    }));
  };

  // Exportar a PDF
  const exportToPDF = () => {
    setExporting(true);
    
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      
      // Título principal
      doc.setFontSize(22);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(196, 18, 48);
      doc.text('AE BADALONES', pageWidth / 2, 20, { align: 'center' });
      
      doc.setFontSize(16);
      doc.setTextColor(26, 26, 26);
      doc.text(teamName, pageWidth / 2, 28, { align: 'center' });
      
      doc.setFontSize(12);
      doc.setFont(undefined, 'normal');
      doc.setTextColor(100, 100, 100);
      doc.text('Informe Estadistic Temporada 2024-2025', pageWidth / 2, 35, { align: 'center' });
      
      // Información general
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      const today = new Date().toLocaleDateString('ca-ES', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      doc.text(`Data: ${today}`, 14, 45);
      doc.text(`Partits analitzats: ${matches.length}`, 14, 50);
      doc.text(`Jugadores: ${getTeamStats().length}`, 14, 55);
      
      // Subtítulo para la tabla
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(196, 18, 48);
      doc.text('Estadistiques per Jugadora', 14, 65);
      
      // Tabla de estadísticas
      const tableData = getTeamStats().map(player => [
        player.name,
        player.gamesPlayed.toString(),
        player.avgMinutes,
        player.avgPoints,
        player.tlPercent,
        player.t2Percent,
        player.t3Percent,
        player.avgPlusMinus
      ]);
      
      doc.autoTable({
        startY: 70,
        head: [['Jugadora', 'PJ', 'Min', 'Pts', 'TL%', 'T2%', 'T3%', '±']],
        body: tableData,
        theme: 'grid',
        headStyles: {
          fillColor: [196, 18, 48],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          halign: 'center',
          fontSize: 10
        },
        styles: {
          fontSize: 9,
          cellPadding: 4,
          halign: 'center',
          valign: 'middle'
        },
        columnStyles: {
          0: { halign: 'left', fontStyle: 'bold', cellWidth: 50 },
          1: { cellWidth: 15 },
          2: { cellWidth: 20 },
          3: { cellWidth: 20 },
          4: { cellWidth: 20 },
          5: { cellWidth: 20 },
          6: { cellWidth: 20 },
          7: { cellWidth: 20 }
        },
        alternateRowStyles: {
          fillColor: [250, 250, 250]
        }
      });
      
      // Pie de página
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(
          `Pagina ${i} de ${pageCount} - AE Badalones ${teamName}`,
          pageWidth / 2,
          doc.internal.pageSize.getHeight() - 10,
          { align: 'center' }
        );
      }
      
      // Guardar PDF
      const fileName = `AE_Badalones_${teamName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
      
      alert('PDF descarregat correctament!');
    } catch (error) {
      console.error('Error generant PDF:', error);
      alert('Error al generar el PDF: ' + error.message);
    } finally {
      setExporting(false);
    }
  };

  // Exportar a Excel
  const exportToExcel = () => {
    setExporting(true);
    
    try {
      const workbook = XLSX.utils.book_new();
      
      // === HOJA 1: RESUMEN GENERAL ===
      const summaryData = [
        ['AE BADALONES - ' + teamName],
        ['Informe Estadistic Temporada 2024-2025'],
        [''],
        ['Data:', new Date().toLocaleDateString('ca-ES')],
        ['Partits Analitzats:', matches.length],
        ['Jugadores:', getTeamStats().length],
        [''],
        [''],
      ];
      
      const ws1 = XLSX.utils.aoa_to_sheet(summaryData);
      
      // Añadir tabla de estadísticas al resumen
      const playerData = getTeamStats();
      XLSX.utils.sheet_add_aoa(ws1, [
        ['ESTADISTIQUES PER JUGADORA'],
        [''],
        ['Jugadora', 'Partits', 'Min/P', 'Pts/P', 'TL%', 'T2%', 'T3%', '±/P']
      ], { origin: 'A9' });
      
      XLSX.utils.sheet_add_json(ws1, playerData.map(p => ({
        'Jugadora': p.name,
        'Partits': p.gamesPlayed,
        'Min/P': p.avgMinutes,
        'Pts/P': p.avgPoints,
        'TL%': p.tlPercent,
        'T2%': p.t2Percent,
        'T3%': p.t3Percent,
        '±/P': p.avgPlusMinus
      })), { origin: 'A11', skipHeader: true });
      
      // Ajustar anchos de columna
      ws1['!cols'] = [
        { wch: 25 }, { wch: 10 }, { wch: 10 }, { wch: 10 },
        { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 }
      ];
      
      XLSX.utils.book_append_sheet(workbook, ws1, 'Resum General');
      
      // === HOJA 2: DETALL PER JUGADORA ===
      const detailedPlayerData = [];
      
      playerData.forEach(player => {
        // Header de jugadora
        detailedPlayerData.push({
          'Jugadora': player.name,
          'Partits Jugats': player.gamesPlayed,
          'Promig Minuts': player.avgMinutes,
          'Promig Punts': player.avgPoints,
          'TL%': player.tlPercent,
          'T2%': player.t2Percent,
          'T3%': player.t3Percent,
          '± Promig': player.avgPlusMinus
        });
        
        // Detalle por partido
        matches.forEach((match, idx) => {
          const playerInMatch = match.players.find(p => p.name === player.name);
          if (playerInMatch) {
            detailedPlayerData.push({
              'Jugadora': `  J${idx + 1}: ${match.matchResult.substring(0, 30)}...`,
              'Partits Jugats': '',
              'Promig Minuts': playerInMatch.timePlayed?.toFixed(1) || 0,
              'Promig Punts': playerInMatch.data?.score || 0,
              'TL%': `${playerInMatch.data?.shotsOfOneSuccessful || 0}/${playerInMatch.data?.shotsOfOneAttempted || 0}`,
              'T2%': playerInMatch.data?.shootingOfTwoSuccessfulPoint?.length || 0,
              'T3%': playerInMatch.data?.shootingOfThreeSuccessfulPoint?.length || 0,
              '± Promig': playerInMatch.inOut || 0
            });
          }
        });
        
        // Fila vacía entre jugadoras
        detailedPlayerData.push({});
      });
      
      const ws2 = XLSX.utils.json_to_sheet(detailedPlayerData);
      ws2['!cols'] = [
        { wch: 35 }, { wch: 12 }, { wch: 12 }, { wch: 12 },
        { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 }
      ];
      
      XLSX.utils.book_append_sheet(workbook, ws2, 'Detall Jugadores');
      
      // === HOJA 3: DETALL PER PARTIT ===
      const matchDetailsData = [];
      
      matches.forEach((match, index) => {
        matchDetailsData.push({
          'Jornada': `JORNADA ${index + 1}`,
          'Partit': match.matchResult,
          'Jugadora': '',
          'Minuts': '',
          'Punts': '',
          'TL': '',
          'T2': '',
          'T3': '',
          '±': ''
        });
        
        match.players
          .sort((a, b) => (b.timePlayed || 0) - (a.timePlayed || 0))
          .forEach(player => {
            matchDetailsData.push({
              'Jornada': '',
              'Partit': '',
              'Jugadora': player.name,
              'Minuts': player.timePlayed?.toFixed(1) || 0,
              'Punts': player.data?.score || 0,
              'TL': `${player.data?.shotsOfOneSuccessful || 0}/${player.data?.shotsOfOneAttempted || 0}`,
              'T2': player.data?.shootingOfTwoSuccessfulPoint?.length || 0,
              'T3': player.data?.shootingOfThreeSuccessfulPoint?.length || 0,
              '±': player.inOut || 0
            });
          });
        
        matchDetailsData.push({});
      });
      
      const ws3 = XLSX.utils.json_to_sheet(matchDetailsData);
      ws3['!cols'] = [
        { wch: 12 }, { wch: 40 }, { wch: 25 }, { wch: 10 },
        { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 }
      ];
      
      XLSX.utils.book_append_sheet(workbook, ws3, 'Detall Partits');
      
      // === HOJA 4: EVOLUCIÓ JUGADORES ===
      const evolutionData = [];
      const players = getTeamStats();
      
      // Headers
      const headers = ['Jornada', 'Partit'];
      players.forEach(p => {
        headers.push(p.name + ' (Pts)');
        headers.push(p.name + ' (±)');
      });
      
      evolutionData.push(headers);
      
      // Datos por jornada
      matches.forEach((match, idx) => {
        const row = [`J${idx + 1}`, match.matchResult.substring(0, 30)];
        
        players.forEach(playerStat => {
          const playerInMatch = match.players.find(p => p.name === playerStat.name);
          if (playerInMatch) {
            row.push(playerInMatch.data?.score || 0);
            row.push(playerInMatch.inOut || 0);
          } else {
            row.push('');
            row.push('');
          }
        });
        
        evolutionData.push(row);
      });
      
      const ws4 = XLSX.utils.aoa_to_sheet(evolutionData);
      const cols = [{ wch: 10 }, { wch: 40 }];
      players.forEach(() => {
        cols.push({ wch: 10 }, { wch: 10 });
      });
      ws4['!cols'] = cols;
      
      XLSX.utils.book_append_sheet(workbook, ws4, 'Evolucio');
      
      // Guardar Excel
      const fileName = `AE_Badalones_${teamName.replace(/\s+/g, '_')}_Informe_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(workbook, fileName);
      
      alert('Excel descarregat correctament!');
    } catch (error) {
      console.error('Error generant Excel:', error);
      alert('Error al generar l\'Excel: ' + error.message);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="export-reports-container">
      <h2>Exportar Informes</h2>
      
      <div className="export-info">
        <p>Genera informes complets amb totes les estadístiques del equip</p>
        <div className="export-stats">
          <span className="info-badge">
            <strong>{matches.length}</strong> partits
          </span>
          <span className="info-badge">
            <strong>{getTeamStats().length}</strong> jugadores
          </span>
        </div>
      </div>

      <div className="export-buttons">
        <button 
          className="export-btn pdf-btn" 
          onClick={exportToPDF}
          disabled={exporting}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
          <span>Descarregar PDF</span>
        </button>

        <button 
          className="export-btn excel-btn" 
          onClick={exportToExcel}
          disabled={exporting}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="9" y1="15" x2="15" y2="15"></line>
          </svg>
          <span>Descarregar Excel</span>
        </button>
      </div>

      {exporting && (
        <div className="exporting-message">
          Generant informe...
        </div>
      )}

      <div className="export-features">
        <h3>Què inclou l'informe?</h3>
        <div className="features-grid">
          <div className="feature-item">
            <span className="feature-icon">📊</span>
            <span>Estadístiques mitjanes per jugadora</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">📈</span>
            <span>Detall de cada partit</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">🎯</span>
            <span>Percentatges de tir</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">➕</span>
            <span>Més/Menys per jugadora</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportReports;