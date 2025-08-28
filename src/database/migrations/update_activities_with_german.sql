-- Update activities with German translations from activities.md

-- Update Schladming activities with German titles and descriptions
UPDATE activities SET 
    title_de = 'Wanderung zum Spiegelsee (Reiteralm)',
    description_de = 'Leichte, malerische 4,2 km Wanderung (~1 h 40 min) ab Preunegg Jet zu Spiegelsee & Obersee. Berühmt für Dachstein-Spiegelungen.'
WHERE title = 'Mirror Lake Trail (Reiteralm)';

UPDATE activities SET 
    title_de = 'Komplette Seenrunde (Spiegelsee & Untersee)',
    description_de = 'Ca. 5,1 km Rundweg (~3 h inkl. Pausen) über Spiegelsee, Untersee, Waldsee; ideal.'
WHERE title = 'Complete Lake Circuit (Spiegelsee & Untersee)';

UPDATE activities SET 
    title_de = 'Gasselhöhe–Spiegelsee–Obersee Panorama',
    description_de = 'Wanderung zur Gasselhöhe, durch Wald zum Spiegelsee; optionale Besteigung Rippetegg (2 126 m) über Obersee.'
WHERE title = 'Gasselhöhe–Spiegelsee–Obersee Panorama';

UPDATE activities SET 
    title_de = 'Spiegelsee erweiterte Runde',
    description_de = 'Erweiterung mit Rückweg über Untersee (+ 30 min) oder große Runde über Rippetegg & Gasselhöhe (+ 2 h).'
WHERE title = 'Mirror Lake Extended Loop';

UPDATE activities SET 
    title_de = 'Reiteralmsee Rundweg (kinderwagentauglich)',
    description_de = 'Leichter Rundweg ab Preunegg-Jet um den Reiteralmsee; flach und kinderwagentauglich.'
WHERE title = 'Reiteralm Lake Stroller Loop';

UPDATE activities SET 
    title_de = 'Alpiner Rundweg Moaralmsee',
    description_de = 'Gipfelwanderung über Hauser Kaibling (2 015 m) mit Panoramablick, Abstieg zum türkisfarbenen Moaralmsee via Weg 45.'
WHERE title = 'Moaralmsee Alpine Loop';

UPDATE activities SET 
    title_de = 'Schafsinn-Rundweg',
    description_de = 'Familienrunde mit Barfuß-/"Schafsinn"-Stationen; kurze kinderwagentaugliche Schleife (40 min) oder volle Runde (1 h 45 min).'
WHERE title = 'Schafsinn Circular Trail';

UPDATE activities SET 
    title_de = 'Hopsiland Planai',
    description_de = 'Höchstgelegener Spielplatz: 1,5 km kinderwagentauglicher Rundweg auf Planai mit Rutschen, Wasserspielen etc.'
WHERE title = 'Hopsiland Planai (Playground Trail)';

UPDATE activities SET 
    title_de = 'Dachstein Skywalk, Hängebrücke, "Treppe ins Nichts" & Eispalast',
    description_de = 'Gletscher-Attraktionen: Skywalk, Hängebrücke, gläserne Treppe „ins Nichts" und Eispalast.'
WHERE title = 'Dachstein Skywalk + Ice Palace';

UPDATE activities SET 
    title_de = 'Rittisberg Coaster',
    description_de = '1,3 km Alpen-Coaster mit Spiralen & Steilkurven; bei Sonne oder Regen geöffnet.'
WHERE title = 'Rittisberg Coaster (Summer Toboggan)';

UPDATE activities SET 
    title_de = 'Erlebnisbad Schladming',
    description_de = 'Hallenbad mit 66 m Rutsche, Kinderbereich, Sauna & Fitness – ideal bei Regen.'
WHERE title = 'Erlebnisbad Schladming';

UPDATE activities SET 
    title_de = 'Erlebnis-Therme',
    description_de = 'Familien-Therme mit Rutschen (inkl. Looping), Becken & Saunawelt; täglich 09–22 Uhr.'
WHERE title = 'Therme Amadé (Altenmarkt)';

UPDATE activities SET 
    title_de = 'Abenteuerpark Gröbming',
    description_de = 'Hochseilpark im Wald: 18–22 Parcours, 200+ Stationen; ideal für Familien/Gruppen.'
WHERE title = 'Adventure Park Gröbming';

UPDATE activities SET 
    title_de = 'Zipline Stoderzinken',
    description_de = 'Europas Mega-Zipline: 2,5 km, bis ~115 km/h, vier Seile – Adrenalinkick pur.'
WHERE title = 'Zipline Stoderzinken';

UPDATE activities SET 
    title_de = 'Tandem-Paragleiten',
    description_de = 'Über Schladming schweben mit staatlich geprüften Piloten.'
WHERE title = 'Tandem Paragliding';

UPDATE activities SET 
    title_de = 'Ennsradweg',
    description_de = 'Malerischer Flussradweg mit familienfreundlichen Abschnitten durch Täler & Seen.'
WHERE title = 'Enns Bike Path';

UPDATE activities SET 
    title_de = 'Rafting auf der Enns',
    description_de = 'Einsteigerfreundliches Wildwasser mit lokalen Guides.'
WHERE title = 'Rafting on the Enns';

UPDATE activities SET 
    title_de = 'Schladminger Brauerei',
    description_de = 'Regionale „Green Brewery" mit Shop/Verkostung—ideal bei Regen.'
WHERE title = 'Schladming Brewery Tour';

UPDATE activities SET 
    title_de = 'Golfclub Schladming-Dachstein',
    description_de = '18-Loch-„Pebble Beach der Alpen": malerisch und sportlich.'
WHERE title = 'Golfclub Schladming-Dachstein';

-- Update existing sample activities with German translations
UPDATE activities SET 
    title_de = 'Planai Skifahren',
    description_de = 'Weltklasse-Skifahren auf dem Planai-Berg, Heimat des berühmten Nachtslaloms.'
WHERE title = 'Planai Skiing';

UPDATE activities SET 
    title_de = 'Dachstein Gletscher Tour',
    description_de = 'Besuchen Sie den spektakulären Dachstein Gletscher mit Eispalast und Hängebrücke.'
WHERE title = 'Dachstein Glacier Tour';

UPDATE activities SET 
    title_de = 'Schladming Spa Entspannung',
    description_de = 'Entspannen Sie im luxuriösen Amadé Spa mit Thermalbädern und Wellness-Behandlungen.'
WHERE title = 'Schladming Spa Relaxation';

UPDATE activities SET 
    title_de = 'Traditionelles österreichisches Essen',
    description_de = 'Genießen Sie authentische österreichische Küche im Gasthof Zur Alten Post.'
WHERE title = 'Traditional Austrian Dining';

UPDATE activities SET 
    title_de = 'Wandern Rohrmoos Plateau',
    description_de = 'Wunderschöne Wanderwege auf dem Rohrmoos Plateau mit atemberaubendem Bergblick.'
WHERE title = 'Hiking Rohrmoos Plateau';