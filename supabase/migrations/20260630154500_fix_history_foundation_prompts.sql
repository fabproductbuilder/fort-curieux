-- Correctif Culture / Histoire : ajoute les prompts liés aux items déjà insérés.
-- La migration précédente a bien créé les items Histoire, mais les prompts ne voyaient pas ces items
-- dans la même instruction. Cette migration est idempotente et n'ajoute aucun doublon.

with source_events as (
	select *
	from (
	values
		('Fondation légendaire de Rome', '753 av. J.-C.', 'Rome', 'Repère traditionnel de la naissance de Rome.', 'date', '753 av. J.-C.', 'le repère légendaire de naissance de Rome', '10001'),
		('Bataille de Marathon', '490 av. J.-C.', 'Grèce', 'Victoire grecque majeure pendant les guerres médiques.', 'date', '490 av. J.-C.', 'la victoire grecque contre les Perses près d''Athènes', '10002'),
		('Bataille de Salamine', '480 av. J.-C.', 'Grèce', 'Bataille navale majeure des guerres médiques.', 'date', '480 av. J.-C.', 'la grande bataille navale des guerres médiques', '10003'),
		('Conquête de la Gaule', '58-51 av. J.-C.', 'Gaule', 'Campagne militaire menée par Jules César.', 'period', '58-51 av. J.-C.', 'la campagne militaire menée par Jules César en Gaule', '10004'),
		('Assassinat de Jules César', '44 av. J.-C.', 'Rome', 'Mort de Jules César pendant la crise de la République romaine.', 'date', '44 av. J.-C.', 'la mort de César aux ides de mars', '10005'),
		('Bataille d''Actium', '31 av. J.-C.', 'Méditerranée orientale', 'Victoire d''Octave sur Marc Antoine et Cléopâtre.', 'date', '31 av. J.-C.', 'la victoire d''Octave sur Marc Antoine et Cléopâtre', '10006'),
		('Début de l''Empire romain', '27 av. J.-C.', 'Rome', 'Auguste devient le premier empereur romain.', 'date', '27 av. J.-C.', 'l''installation d''Auguste comme premier empereur romain', '10007'),
		('Éruption du Vésuve', '79', 'Italie', 'Catastrophe antique qui ensevelit Pompéi.', 'date', '79', 'la catastrophe qui ensevelit Pompéi', '10008'),
		('Édit de Milan', '313', 'Empire romain', 'Décision accordant la liberté de culte aux chrétiens.', 'date', '313', 'la décision impériale accordant la liberté de culte aux chrétiens', '10009'),
		('Concile de Nicée', '325', 'Empire romain', 'Premier grand concile chrétien réuni par Constantin.', 'date', '325', 'le premier grand concile chrétien réuni par Constantin', '10010'),
		('Partage définitif de l''Empire romain', '395', 'Empire romain', 'Séparation durable entre Empire romain d''Orient et d''Occident.', 'date', '395', 'la séparation durable entre Orient et Occident romains', '10011'),
		('Chute de l''Empire romain d''Occident', '476', 'Europe occidentale', 'Déposition du dernier empereur romain d''Occident.', 'date', '476', 'la déposition de Romulus Augustule', '10012'),
		('Baptême de Clovis', 'vers 496', 'Francs', 'Repère fondateur de la monarchie franque chrétienne.', 'date', 'vers 496', 'la conversion chrétienne du roi des Francs', '10013'),
		('Hégire', '622', 'Arabie', 'Départ de Mahomet de La Mecque vers Médine.', 'date', '622', 'le départ de Mahomet vers Médine', '10014'),
		('Couronnement de Charlemagne', '800', 'Rome', 'Charlemagne est couronné empereur d''Occident.', 'date', '800', 'le couronnement impérial de Charlemagne à Rome', '10015'),
		('Traité de Verdun', '843', 'Empire carolingien', 'Partage de l''Empire carolingien entre les petits-fils de Charlemagne.', 'date', '843', 'le partage de l''Empire carolingien', '10016'),
		('Bataille d''Hastings', '1066', 'Angleterre', 'Victoire normande qui transforme l''histoire anglaise.', 'date', '1066', 'la conquête normande de l''Angleterre', '10017'),
		('Première croisade', '1096-1099', 'Proche-Orient', 'Expédition militaire chrétienne vers Jérusalem.', 'period', '1096-1099', 'la première grande expédition croisée vers Jérusalem', '10018'),
		('Prise de Jérusalem par les croisés', '1099', 'Jérusalem', 'Fin militaire de la première croisade.', 'date', '1099', 'la prise de Jérusalem à la fin de la première croisade', '10019'),
		('Magna Carta', '1215', 'Angleterre', 'Texte limitant l''autorité royale anglaise.', 'date', '1215', 'la charte anglaise qui limite le pouvoir du roi', '10020'),
		('Règne de Saint Louis', '1226-1270', 'France', 'Règne capétien associé à la justice royale.', 'period', '1226-1270', 'le règne capétien associé à la justice royale', '10021'),
		('Début de la guerre de Cent Ans', '1337', 'France et Angleterre', 'Début du long conflit entre royaumes de France et d''Angleterre.', 'date', '1337', 'l''ouverture du long conflit franco-anglais médiéval', '10022'),
		('Grande peste en Europe', '1347-1351', 'Europe', 'Épidémie majeure qui bouleverse l''Europe médiévale.', 'period', '1347-1351', 'l''épidémie médiévale qui ravage l''Europe', '10023'),
		('Bataille d''Azincourt', '1415', 'France', 'Victoire anglaise pendant la guerre de Cent Ans.', 'date', '1415', 'la victoire anglaise pendant la guerre de Cent Ans', '10024'),
		('Libération d''Orléans par Jeanne d''Arc', '1429', 'France', 'Tournant français de la guerre de Cent Ans.', 'date', '1429', 'le tournant militaire associé à Jeanne d''Arc', '10025'),
		('Chute de Constantinople', '1453', 'Constantinople', 'Fin de l''Empire byzantin.', 'date', '1453', 'la fin de l''Empire byzantin', '10026'),
		('Premier voyage de Christophe Colomb', '1492', 'Atlantique', 'Voyage européen vers les Amériques.', 'date', '1492', 'le voyage européen qui atteint les Amériques', '10027'),
		('Traité de Tordesillas', '1494', 'Monde atlantique', 'Partage des zones d''expansion entre Espagne et Portugal.', 'date', '1494', 'le partage des zones d''expansion ibériques', '10028'),
		('Début de la Réforme protestante', '1517', 'Europe', 'Publication des thèses de Martin Luther.', 'date', '1517', 'la contestation religieuse lancée par Martin Luther', '10029'),
		('Tour du monde de Magellan-Elcano', '1519-1522', 'Monde', 'Première circumnavigation réalisée par une expédition européenne.', 'period', '1519-1522', 'la première circumnavigation européenne', '10030'),
		('Bataille de Pavie', '1525', 'Italie', 'Défaite de François Ier face à Charles Quint.', 'date', '1525', 'la défaite de François Ier en Italie', '10031'),
		('Acte de suprématie d''Henri VIII', '1534', 'Angleterre', 'Rupture institutionnelle entre le roi d''Angleterre et Rome.', 'date', '1534', 'la rupture anglaise avec l''autorité du pape', '10032'),
		('Édit de Nantes', '1598', 'France', 'Texte de tolérance religieuse promulgué par Henri IV.', 'date', '1598', 'le texte de tolérance religieuse d''Henri IV', '10033'),
		('Début de la guerre de Trente Ans', '1618', 'Europe', 'Début d''un conflit européen majeur du XVIIe siècle.', 'date', '1618', 'l''ouverture du grand conflit européen du XVIIe siècle', '10034'),
		('Paix de Westphalie', '1648', 'Europe', 'Traités mettant fin à la guerre de Trente Ans.', 'date', '1648', 'les traités qui mettent fin à la guerre de Trente Ans', '10035'),
		('La Fronde', '1648-1653', 'France', 'Période de troubles politiques pendant la minorité de Louis XIV.', 'period', '1648-1653', 'les troubles politiques français pendant la minorité de Louis XIV', '10036'),
		('Début du règne personnel de Louis XIV', '1661', 'France', 'Louis XIV gouverne sans principal ministre.', 'date', '1661', 'le début du gouvernement personnel du Roi-Soleil', '10037'),
		('Révocation de l''Édit de Nantes', '1685', 'France', 'Fin de la tolérance officielle accordée aux protestants français.', 'date', '1685', 'la fin de la tolérance officielle envers les protestants français', '10038'),
		('Glorieuse Révolution', '1688', 'Angleterre', 'Changement de régime qui renforce la monarchie parlementaire anglaise.', 'date', '1688', 'la révolution anglaise qui renforce le Parlement', '10039'),
		('Déclaration d''indépendance des États-Unis', '1776', 'États-Unis', 'Texte fondateur de l''indépendance américaine.', 'date', '1776', 'le texte fondateur de l''indépendance américaine', '10040'),
		('Prise de la Bastille', '1789', 'France', 'Événement emblématique du début de la Révolution française.', 'date', '1789', 'l''événement parisien du 14 juillet', '10041'),
		('Déclaration des droits de l''homme et du citoyen', '1789', 'France', 'Texte fondamental de la Révolution française.', 'date', '1789', 'le grand texte révolutionnaire sur les droits', '10042'),
		('Abolition des privilèges', '1789', 'France', 'Décision de la nuit du 4 août pendant la Révolution française.', 'date', '1789', 'la décision révolutionnaire de la nuit du 4 août', '10043'),
		('Proclamation de la Première République française', '1792', 'France', 'Fin de la monarchie constitutionnelle en France.', 'date', '1792', 'la naissance du premier régime républicain français', '10044'),
		('Exécution de Louis XVI', '1793', 'France', 'Mort du roi de France pendant la Révolution.', 'date', '1793', 'la mort du roi jugé par la Convention', '10045'),
		('Coup d''État du 18 Brumaire', '1799', 'France', 'Prise de pouvoir de Bonaparte et début du Consulat.', 'date', '1799', 'la prise de pouvoir de Bonaparte avant le Consulat', '10046'),
		('Sacre de Napoléon Ier', '1804', 'France', 'Napoléon Bonaparte devient empereur des Français.', 'date', '1804', 'le couronnement impérial de Napoléon', '10047'),
		('Bataille de Trafalgar', '1805', 'Atlantique', 'Victoire navale britannique contre la flotte franco-espagnole.', 'date', '1805', 'la grande victoire navale britannique contre Napoléon', '10048'),
		('Bataille d''Austerlitz', '1805', 'Europe centrale', 'Victoire majeure de Napoléon contre l''Autriche et la Russie.', 'date', '1805', 'la victoire napoléonienne des Trois Empereurs', '10049'),
		('Retraite de Russie', '1812', 'Russie', 'Échec majeur de la campagne napoléonienne en Russie.', 'date', '1812', 'l''échec de la campagne napoléonienne en Russie', '10050'),
		('Bataille de Waterloo', '1815', 'Belgique', 'Défaite finale de Napoléon Ier.', 'date', '1815', 'la défaite finale de Napoléon', '10051'),
		('Congrès de Vienne', '1814-1815', 'Europe', 'Réorganisation de l''Europe après les guerres napoléoniennes.', 'period', '1814-1815', 'la réorganisation de l''Europe après Napoléon', '10052'),
		('Indépendance de la Grèce', '1830', 'Grèce', 'Reconnaissance de l''indépendance grecque.', 'date', '1830', 'la reconnaissance de l''indépendance grecque', '10053'),
		('Révolution de 1848 en France', '1848', 'France', 'Chute de la monarchie de Juillet et naissance de la Deuxième République.', 'date', '1848', 'la chute de la monarchie de Juillet', '10054'),
		('Proclamation du Second Empire', '1852', 'France', 'Louis-Napoléon Bonaparte devient Napoléon III.', 'date', '1852', 'le retour d''un Empire en France au XIXe siècle', '10055'),
		('Unification italienne', '1861', 'Italie', 'Proclamation du royaume d''Italie.', 'date', '1861', 'la proclamation du royaume d''Italie', '10056'),
		('Guerre de Sécession', '1861-1865', 'États-Unis', 'Guerre civile américaine entre Nord et Sud.', 'period', '1861-1865', 'la guerre civile américaine', '10057'),
		('Proclamation d''émancipation', '1863', 'États-Unis', 'Mesure de Lincoln contre l''esclavage dans les États rebelles.', 'date', '1863', 'la décision de Lincoln contre l''esclavage dans les États rebelles', '10058'),
		('Proclamation de la Troisième République', '1870', 'France', 'Naissance du régime républicain durable après le Second Empire.', 'date', '1870', 'la naissance du régime républicain français durable', '10059'),
		('Unification allemande', '1871', 'Allemagne', 'Proclamation de l''Empire allemand à Versailles.', 'date', '1871', 'la proclamation de l''Empire allemand à Versailles', '10060'),
		('Commune de Paris', '1871', 'France', 'Insurrection parisienne après la guerre franco-prussienne.', 'date', '1871', 'l''insurrection parisienne du printemps 1871', '10061'),
		('Conférence de Berlin', '1884-1885', 'Afrique', 'Réunion européenne sur les règles de colonisation en Afrique.', 'period', '1884-1885', 'la réunion européenne sur le partage colonial de l''Afrique', '10062'),
		('Affaire Dreyfus', '1894', 'France', 'Crise politique française autour d''une condamnation injuste.', 'date', '1894', 'la crise française liée à une condamnation pour trahison', '10063'),
		('Premier vol des frères Wright', '1903', 'États-Unis', 'Repère majeur de l''aviation motorisée.', 'date', '1903', 'le premier vol motorisé contrôlé des frères Wright', '10064'),
		('Révolution russe de 1905', '1905', 'Russie', 'Soulèvement qui annonce les crises de l''Empire russe.', 'date', '1905', 'le soulèvement russe antérieur à 1917', '10065'),
		('Attentat de Sarajevo', '1914', 'Bosnie', 'Assassinat de l''archiduc François-Ferdinand.', 'date', '1914', 'l''assassinat de François-Ferdinand', '10066'),
		('Début de la Première Guerre mondiale', '1914', 'Europe', 'Entrée de l''Europe dans un conflit mondial.', 'date', '1914', 'l''entrée de l''Europe dans le premier conflit mondial', '10067'),
		('Bataille de Verdun', '1916', 'France', 'Bataille majeure de la Première Guerre mondiale.', 'date', '1916', 'la grande bataille franco-allemande de la Meuse', '10068'),
		('Révolution russe', '1917', 'Russie', 'Renversement du tsarisme puis prise de pouvoir bolchevique.', 'date', '1917', 'la chute du tsarisme puis la prise de pouvoir bolchevique', '10069'),
		('Armistice de la Première Guerre mondiale', '1918', 'Europe', 'Fin des combats de la Première Guerre mondiale.', 'date', '1918', 'la fin des combats du premier conflit mondial', '10070'),
		('Traité de Versailles', '1919', 'France', 'Traité de paix imposé à l''Allemagne après 1918.', 'date', '1919', 'le traité de paix imposé à l''Allemagne après 1918', '10071'),
		('Marche sur Rome', '1922', 'Italie', 'Arrivée de Mussolini au pouvoir en Italie.', 'date', '1922', 'l''arrivée de Mussolini au pouvoir', '10072'),
		('Krach de Wall Street', '1929', 'États-Unis', 'Début symbolique de la Grande Dépression.', 'date', '1929', 'le choc financier qui ouvre la Grande Dépression', '10073'),
		('Arrivée d''Hitler au pouvoir', '1933', 'Allemagne', 'Hitler devient chancelier d''Allemagne.', 'date', '1933', 'la nomination d''Hitler comme chancelier', '10074'),
		('Début de la Seconde Guerre mondiale', '1939', 'Europe', 'Invasion de la Pologne par l''Allemagne nazie.', 'date', '1939', 'l''invasion de la Pologne par l''Allemagne nazie', '10075'),
		('Appel du 18 Juin', '1940', 'France', 'Appel radiophonique du général de Gaulle depuis Londres.', 'date', '1940', 'l''appel de De Gaulle depuis Londres', '10076'),
		('Attaque de Pearl Harbor', '1941', 'Hawaï', 'Attaque japonaise qui entraîne l''entrée en guerre des États-Unis.', 'date', '1941', 'l''attaque japonaise qui fait entrer les États-Unis en guerre', '10077'),
		('Débarquement de Normandie', '1944', 'France', 'Opération alliée majeure du 6 juin.', 'date', '1944', 'l''opération alliée du 6 juin en Normandie', '10078'),
		('Libération de Paris', '1944', 'France', 'Fin de l''occupation allemande dans la capitale française.', 'date', '1944', 'la fin de l''occupation allemande dans la capitale française', '10079'),
		('Capitulation de l''Allemagne nazie', '1945', 'Europe', 'Fin de la Seconde Guerre mondiale en Europe.', 'date', '1945', 'la fin de la guerre en Europe', '10080'),
		('Bombardements atomiques d''Hiroshima et Nagasaki', '1945', 'Japon', 'Utilisation de l''arme atomique contre deux villes japonaises.', 'date', '1945', 'l''utilisation de l''arme atomique contre deux villes japonaises', '10081'),
		('Création de l''ONU', '1945', 'Monde', 'Naissance de l''Organisation des Nations unies.', 'date', '1945', 'la naissance de l''Organisation des Nations unies', '10082'),
		('Indépendance de l''Inde', '1947', 'Inde', 'Fin de la domination britannique sur l''Inde.', 'date', '1947', 'la fin de la domination britannique sur l''Inde', '10083'),
		('Doctrine Truman', '1947', 'États-Unis', 'Doctrine américaine d''endiguement au début de la guerre froide.', 'date', '1947', 'la politique américaine d''endiguement au début de la guerre froide', '10084'),
		('Plan Marshall', '1947', 'Europe', 'Programme américain d''aide à la reconstruction européenne.', 'date', '1947', 'l''aide américaine à la reconstruction de l''Europe', '10085'),
		('Proclamation de la République populaire de Chine', '1949', 'Chine', 'Mao Zedong proclame le nouveau régime chinois.', 'date', '1949', 'la proclamation du régime communiste chinois', '10086'),
		('Guerre de Corée', '1950-1953', 'Corée', 'Conflit majeur de la guerre froide en Asie.', 'period', '1950-1953', 'le conflit asiatique majeur du début de la guerre froide', '10087'),
		('Crise de Suez', '1956', 'Égypte', 'Crise internationale autour du canal de Suez.', 'date', '1956', 'la crise internationale autour du canal égyptien', '10088'),
		('Traité de Rome', '1957', 'Europe', 'Traité fondateur de la Communauté économique européenne.', 'date', '1957', 'le traité fondateur de la Communauté économique européenne', '10089'),
		('Guerre d''Algérie', '1954-1962', 'Algérie', 'Conflit de décolonisation entre la France et l''Algérie.', 'period', '1954-1962', 'le conflit de décolonisation entre la France et l''Algérie', '10090'),
		('Indépendance de l''Algérie', '1962', 'Algérie', 'Naissance de l''État algérien indépendant.', 'date', '1962', 'la naissance de l''État algérien indépendant', '10091'),
		('Crise des missiles de Cuba', '1962', 'Cuba', 'Moment de tension extrême entre États-Unis et URSS.', 'date', '1962', 'la confrontation nucléaire autour de Cuba', '10092'),
		('Assassinat de John F. Kennedy', '1963', 'États-Unis', 'Mort du président américain à Dallas.', 'date', '1963', 'la mort du président américain à Dallas', '10093'),
		('Mai 68 en France', '1968', 'France', 'Mouvement social et étudiant majeur.', 'date', '1968', 'le grand mouvement social et étudiant français', '10094'),
		('Premier pas sur la Lune', '1969', 'Espace', 'Neil Armstrong marche sur la Lune.', 'date', '1969', 'la première marche humaine sur la Lune', '10095'),
		('Chute de Saïgon', '1975', 'Vietnam', 'Fin de la guerre du Vietnam.', 'date', '1975', 'la fin militaire de la guerre du Vietnam', '10096'),
		('Révolution iranienne', '1979', 'Iran', 'Renversement du shah et naissance de la République islamique.', 'date', '1979', 'le renversement du shah d''Iran', '10097'),
		('Chute du mur de Berlin', '1989', 'Allemagne', 'Symbole de la fin de la division de Berlin.', 'date', '1989', 'la fin symbolique de la division de Berlin', '10098'),
		('Dissolution de l''URSS', '1991', 'URSS', 'Fin officielle de l''Union soviétique.', 'date', '1991', 'la fin officielle de l''Union soviétique', '10099'),
		('Création de l''Union européenne', '1993', 'Europe', 'Entrée en vigueur du traité de Maastricht.', 'date', '1993', 'l''entrée en vigueur du traité de Maastricht', '10100')
	) as values_table(title, period_label, location_label, short_summary, prompt_type, date_answer, reverse_clue, sort_order)
), source_figures as (
	select *
	from (
	values
		('Alexandre le Grand', 'Antiquité', 'Macédoine', 'Conquérant macédonien de l''Antiquité.', 'Roi de Macédoine et conquérant', 'la conquête d''un vaste empire antique depuis la Macédoine', '20001'),
		('Jules César', 'Antiquité romaine', 'Rome', 'Général et homme politique romain.', 'Général et homme politique romain', 'la conquête de la Gaule par Rome', '20002'),
		('Cléopâtre VII', 'Antiquité', 'Égypte', 'Dernière grande reine de l''Égypte ptolémaïque.', 'Reine d''Égypte', 'la dernière grande reine de l''Égypte antique', '20003'),
		('Auguste', 'Antiquité romaine', 'Rome', 'Premier empereur romain.', 'Premier empereur romain', 'le début de l''Empire romain', '20004'),
		('Constantin Ier', 'Antiquité tardive', 'Empire romain', 'Empereur romain associé à l''Édit de Milan.', 'Empereur romain', 'l''Édit de Milan', '20005'),
		('Charlemagne', 'Moyen Âge', 'Europe occidentale', 'Roi des Francs couronné empereur en 800.', 'Empereur d''Occident', 'le couronnement impérial de l''an 800', '20006'),
		('Hugues Capet', 'Moyen Âge', 'France', 'Premier roi de la dynastie capétienne.', 'Premier roi capétien', 'la dynastie capétienne', '20007'),
		('Guillaume le Conquérant', 'Moyen Âge', 'Normandie et Angleterre', 'Duc de Normandie devenu roi d''Angleterre.', 'Duc de Normandie devenu roi d''Angleterre', 'la conquête de l''Angleterre en 1066', '20008'),
		('Aliénor d''Aquitaine', 'Moyen Âge', 'France et Angleterre', 'Reine de France puis d''Angleterre.', 'Reine de France puis d''Angleterre', 'l''Aquitaine et les cours médiévales', '20009'),
		('Saint Louis', 'Moyen Âge', 'France', 'Roi capétien du XIIIe siècle.', 'Roi de France du XIIIe siècle', 'la justice royale capétienne', '20010'),
		('Jeanne d''Arc', 'Moyen Âge', 'France', 'Figure majeure de la guerre de Cent Ans.', 'Figure de la guerre de Cent Ans', 'la libération d''Orléans en 1429', '20011'),
		('Gutenberg', 'Renaissance', 'Europe', 'Inventeur associé à l''imprimerie à caractères mobiles en Europe.', 'Inventeur associé à l''imprimerie', 'l''imprimerie à caractères mobiles en Europe', '20012'),
		('Christophe Colomb', 'Temps modernes', 'Atlantique', 'Navigateur lié au voyage de 1492 vers les Amériques.', 'Navigateur européen', 'le voyage de 1492 vers les Amériques', '20013'),
		('Vasco de Gama', 'Temps modernes', 'Portugal et Inde', 'Navigateur portugais ouvrant une route maritime vers l''Inde.', 'Navigateur portugais', 'la route maritime vers l''Inde', '20014'),
		('Magellan', 'Temps modernes', 'Monde', 'Navigateur à l''origine de la première circumnavigation européenne.', 'Navigateur portugais', 'le premier tour du monde', '20015'),
		('Léonard de Vinci', 'Renaissance', 'Italie', 'Artiste et savant de la Renaissance.', 'Artiste et savant de la Renaissance', 'La Joconde et les carnets de la Renaissance', '20016'),
		('Michel-Ange', 'Renaissance', 'Italie', 'Artiste majeur de la Renaissance italienne.', 'Artiste de la Renaissance italienne', 'la chapelle Sixtine', '20017'),
		('Martin Luther', 'Temps modernes', 'Europe', 'Réformateur protestant du XVIe siècle.', 'Réformateur protestant', 'les 95 thèses de 1517', '20018'),
		('Henri VIII', 'Temps modernes', 'Angleterre', 'Roi associé à la rupture religieuse anglaise avec Rome.', 'Roi d''Angleterre', 'la rupture anglaise avec Rome', '20019'),
		('Élisabeth Ire', 'Temps modernes', 'Angleterre', 'Reine d''Angleterre de l''époque élisabéthaine.', 'Reine d''Angleterre', 'l''Angleterre élisabéthaine', '20020'),
		('Henri IV', 'Temps modernes', 'France', 'Roi de France associé à l''Édit de Nantes.', 'Roi de France', 'l''Édit de Nantes', '20021'),
		('Richelieu', 'Temps modernes', 'France', 'Cardinal et ministre de Louis XIII.', 'Cardinal et ministre de Louis XIII', 'le renforcement de l''État royal sous Louis XIII', '20022'),
		('Louis XIV', 'Temps modernes', 'France', 'Roi de France surnommé le Roi-Soleil.', 'Roi de France surnommé le Roi-Soleil', 'Versailles et la monarchie absolue', '20023'),
		('Pierre le Grand', 'Temps modernes', 'Russie', 'Tsar réformateur de Russie.', 'Tsar réformateur de Russie', 'la modernisation de la Russie', '20024'),
		('George Washington', 'XVIIIe siècle', 'États-Unis', 'Premier président des États-Unis.', 'Premier président des États-Unis', 'le premier président américain', '20025'),
		('Thomas Jefferson', 'XVIIIe siècle', 'États-Unis', 'Auteur principal de la Déclaration d''indépendance américaine.', 'Homme d''État américain', 'la Déclaration d''indépendance américaine', '20026'),
		('Benjamin Franklin', 'XVIIIe siècle', 'États-Unis', 'Savant et diplomate américain.', 'Savant et diplomate américain', 'la diplomatie américaine pendant l''indépendance', '20027'),
		('Voltaire', 'XVIIIe siècle', 'France', 'Philosophe majeur des Lumières.', 'Philosophe des Lumières', 'la défense de la tolérance au XVIIIe siècle', '20028'),
		('Montesquieu', 'XVIIIe siècle', 'France', 'Philosophe associé à la séparation des pouvoirs.', 'Philosophe des Lumières', 'la séparation des pouvoirs', '20029'),
		('Jean-Jacques Rousseau', 'XVIIIe siècle', 'France', 'Philosophe associé au Contrat social.', 'Philosophe des Lumières', 'Le Contrat social', '20030'),
		('Louis XVI', 'Révolution française', 'France', 'Roi de France pendant la Révolution française.', 'Roi de France pendant la Révolution', 'le roi jugé et exécuté en 1793', '20031'),
		('Marie-Antoinette', 'Révolution française', 'France', 'Reine de France pendant la Révolution française.', 'Reine de France pendant la Révolution', 'la reine de France guillotinée en 1793', '20032'),
		('Robespierre', 'Révolution française', 'France', 'Figure du Comité de salut public.', 'Révolutionnaire français', 'la Terreur', '20033'),
		('Danton', 'Révolution française', 'France', 'Révolutionnaire français des premières années de la Révolution.', 'Révolutionnaire français', 'les premières années de la Révolution française', '20034'),
		('Olympe de Gouges', 'Révolution française', 'France', 'Autrice de la Déclaration des droits de la femme et de la citoyenne.', 'Femme de lettres et militante politique', 'la Déclaration des droits de la femme et de la citoyenne', '20035'),
		('Napoléon Bonaparte', 'XIXe siècle', 'France', 'Général puis empereur des Français.', 'Empereur des Français', 'le Code civil', '20036'),
		('Talleyrand', 'XIXe siècle', 'France', 'Diplomate français du Congrès de Vienne.', 'Diplomate français', 'la diplomatie française au Congrès de Vienne', '20037'),
		('Simón Bolívar', 'XIXe siècle', 'Amérique du Sud', 'Figure des indépendances sud-américaines.', 'Libérateur sud-américain', 'les indépendances d''Amérique du Sud', '20038'),
		('Abraham Lincoln', 'XIXe siècle', 'États-Unis', 'Président américain pendant la guerre de Sécession.', 'Président des États-Unis', 'l''abolition de l''esclavage aux États-Unis', '20039'),
		('Otto von Bismarck', 'XIXe siècle', 'Allemagne', 'Homme d''État associé à l''unification allemande.', 'Homme d''État prussien', 'l''unification allemande', '20040'),
		('Giuseppe Garibaldi', 'XIXe siècle', 'Italie', 'Figure militaire de l''unification italienne.', 'Figure de l''unification italienne', 'l''unification italienne', '20041'),
		('Victoria', 'XIXe siècle', 'Royaume-Uni', 'Reine britannique de l''époque victorienne.', 'Reine du Royaume-Uni', 'l''époque victorienne', '20042'),
		('Karl Marx', 'XIXe siècle', 'Europe', 'Penseur majeur du communisme moderne.', 'Penseur du communisme moderne', 'Le Capital et le marxisme', '20043'),
		('Louis Pasteur', 'XIXe siècle', 'France', 'Scientifique associé à la vaccination et à la pasteurisation.', 'Scientifique français', 'la vaccination contre la rage', '20044'),
		('Marie Curie', 'XXe siècle', 'France', 'Scientifique pionnière de la radioactivité.', 'Scientifique pionnière de la radioactivité', 'les recherches sur la radioactivité', '20045'),
		('Charles de Gaulle', 'XXe siècle', 'France', 'Chef de la France libre puis président de la République.', 'Chef de la France libre puis président', 'l''appel du 18 Juin', '20046'),
		('Winston Churchill', 'XXe siècle', 'Royaume-Uni', 'Premier ministre britannique pendant la Seconde Guerre mondiale.', 'Premier ministre britannique', 'la résistance britannique à Hitler', '20047'),
		('Franklin D. Roosevelt', 'XXe siècle', 'États-Unis', 'Président américain du New Deal et de la Seconde Guerre mondiale.', 'Président des États-Unis', 'le New Deal', '20048'),
		('Adolf Hitler', 'XXe siècle', 'Allemagne', 'Dictateur nazi de l''Allemagne.', 'Dictateur nazi allemand', 'le régime nazi', '20049'),
		('Benito Mussolini', 'XXe siècle', 'Italie', 'Dictateur fasciste italien.', 'Dictateur fasciste italien', 'le fascisme italien', '20050'),
		('Joseph Staline', 'XXe siècle', 'URSS', 'Dirigeant soviétique.', 'Dirigeant soviétique', 'l''Union soviétique pendant la Seconde Guerre mondiale', '20051'),
		('Mao Zedong', 'XXe siècle', 'Chine', 'Dirigeant communiste chinois.', 'Dirigeant communiste chinois', 'la fondation de la République populaire de Chine', '20052'),
		('Gandhi', 'XXe siècle', 'Inde', 'Leader de l''indépendance indienne.', 'Leader de l''indépendance indienne', 'la non-violence et l''indépendance de l''Inde', '20053'),
		('Jawaharlal Nehru', 'XXe siècle', 'Inde', 'Premier Premier ministre de l''Inde indépendante.', 'Premier Premier ministre de l''Inde indépendante', 'l''Inde indépendante après 1947', '20054'),
		('Nelson Mandela', 'XXe siècle', 'Afrique du Sud', 'Leader anti-apartheid et président sud-africain.', 'Leader anti-apartheid', 'la lutte contre l''apartheid', '20055'),
		('Martin Luther King Jr.', 'XXe siècle', 'États-Unis', 'Pasteur et militant des droits civiques.', 'Militant des droits civiques', 'le discours I Have a Dream', '20056'),
		('Rosa Parks', 'XXe siècle', 'États-Unis', 'Figure du mouvement des droits civiques.', 'Figure des droits civiques', 'le boycott des bus de Montgomery', '20057'),
		('John F. Kennedy', 'XXe siècle', 'États-Unis', 'Président américain assassiné en 1963.', 'Président des États-Unis', 'la crise des missiles de Cuba', '20058'),
		('Nikita Khrouchtchev', 'XXe siècle', 'URSS', 'Dirigeant soviétique de la crise de Cuba.', 'Dirigeant soviétique', 'la déstalinisation et la crise de Cuba', '20059'),
		('Youri Gagarine', 'XXe siècle', 'URSS', 'Premier humain dans l''espace.', 'Cosmonaute soviétique', 'le premier vol humain dans l''espace', '20060'),
		('Neil Armstrong', 'XXe siècle', 'États-Unis', 'Premier humain à marcher sur la Lune.', 'Astronaute américain', 'le premier pas sur la Lune', '20061'),
		('Mikhaïl Gorbatchev', 'XXe siècle', 'URSS', 'Dirigeant soviétique de la perestroïka.', 'Dirigeant soviétique', 'la perestroïka', '20062'),
		('Margaret Thatcher', 'XXe siècle', 'Royaume-Uni', 'Première ministre britannique.', 'Première ministre britannique', 'le tournant libéral britannique', '20063'),
		('Lech Walesa', 'XXe siècle', 'Pologne', 'Leader de Solidarnosc puis président polonais.', 'Leader de Solidarnosc', 'Solidarnosc', '20064'),
		('Deng Xiaoping', 'XXe siècle', 'Chine', 'Dirigeant chinois des réformes économiques.', 'Dirigeant chinois', 'les réformes économiques chinoises', '20065'),
		('Ho Chi Minh', 'XXe siècle', 'Vietnam', 'Dirigeant vietnamien lié à l''indépendance du Vietnam.', 'Dirigeant vietnamien', 'l''indépendance du Vietnam', '20066'),
		('Mustafa Kemal Atatürk', 'XXe siècle', 'Turquie', 'Fondateur de la Turquie moderne.', 'Fondateur de la Turquie moderne', 'la République turque', '20067'),
		('Catherine II', 'XVIIIe siècle', 'Russie', 'Impératrice de Russie.', 'Impératrice de Russie', 'la Russie du XVIIIe siècle', '20068'),
		('Périclès', 'Antiquité', 'Athènes', 'Homme d''État athénien.', 'Homme d''État athénien', 'l''âge d''or d''Athènes', '20069'),
		('Hannibal Barca', 'Antiquité', 'Carthage', 'Général carthaginois.', 'Général carthaginois', 'la traversée des Alpes contre Rome', '20070'),
		('Saladin', 'Moyen Âge', 'Proche-Orient', 'Dirigeant majeur du temps des croisades.', 'Dirigeant musulman des croisades', 'la reprise de Jérusalem en 1187', '20071'),
		('Gengis Khan', 'Moyen Âge', 'Asie centrale', 'Fondateur de l''Empire mongol.', 'Fondateur de l''Empire mongol', 'l''Empire mongol', '20072'),
		('Marco Polo', 'Moyen Âge', 'Venise et Asie', 'Voyageur vénitien connu pour son récit asiatique.', 'Voyageur vénitien', 'son récit de voyage vers l''Asie', '20073'),
		('Florence Nightingale', 'XIXe siècle', 'Royaume-Uni', 'Pionnière des soins infirmiers modernes.', 'Pionnière des soins infirmiers modernes', 'les soins infirmiers modernes', '20074'),
		('Susan B. Anthony', 'XIXe siècle', 'États-Unis', 'Militante américaine du droit de vote des femmes.', 'Militante du suffrage féminin', 'le suffrage féminin américain', '20075')
	) as values_table(title, period_label, location_label, short_summary, role_answer, reverse_clue, sort_order)
), source_dates as (
	select *
	from (
	values
		('Antiquité', 'jusqu''en 476', 'Europe et Méditerranée', 'Grande période précédant le Moyen Âge en Europe.', 'period', 'Quelle période suit généralement l''Antiquité en Europe ?', 'Le Moyen Âge', '30001'),
		('Moyen Âge', '476-1492', 'Europe', 'Période située entre l''Antiquité et les Temps modernes.', 'period', 'Quelle période se situe entre l''Antiquité et les Temps modernes ?', 'Le Moyen Âge', '30002'),
		('Renaissance', 'XVe-XVIe siècles', 'Europe', 'Période de renouveau artistique et intellectuel.', 'period', 'Quelle période de renouveau artistique suit la fin du Moyen Âge en Europe ?', 'La Renaissance', '30003'),
		('Temps modernes', '1492-1789', 'Europe', 'Période qui suit traditionnellement le Moyen Âge.', 'period', 'Quelle période historique va traditionnellement de 1492 à 1789 ?', 'Les Temps modernes', '30004'),
		('Époque contemporaine', 'depuis 1789', 'Monde', 'Période ouverte par la Révolution française.', 'period', 'Quelle période historique commence généralement en 1789 ?', 'L''époque contemporaine', '30005'),
		('République romaine', '509-27 av. J.-C.', 'Rome', 'Régime romain antérieur à l''Empire.', 'period', 'Quelle période romaine précède l''Empire romain ?', 'La République romaine', '30006'),
		('Empire romain', '27 av. J.-C.-476', 'Rome', 'Régime impérial romain en Occident jusqu''en 476.', 'period', 'Quelle période romaine commence avec Auguste ?', 'L''Empire romain', '30007'),
		('Haut Moyen Âge', 'Ve-Xe siècles', 'Europe', 'Première partie du Moyen Âge.', 'period', 'Comment appelle-t-on la première partie du Moyen Âge ?', 'Le Haut Moyen Âge', '30008'),
		('Bas Moyen Âge', 'XIe-XVe siècles', 'Europe', 'Dernière partie du Moyen Âge.', 'period', 'Comment appelle-t-on la dernière partie du Moyen Âge ?', 'Le Bas Moyen Âge', '30009'),
		('Guerre de Cent Ans', '1337-1453', 'France et Angleterre', 'Long conflit médiéval franco-anglais.', 'period', 'Quelle guerre oppose longtemps la France et l''Angleterre de 1337 à 1453 ?', 'La guerre de Cent Ans', '30010'),
		('Renaissance française', 'XVIe siècle', 'France', 'Renaissance artistique et culturelle en France.', 'period', 'À quel siècle associe-t-on surtout la Renaissance française ?', 'Le XVIe siècle', '30011'),
		('Grandes découvertes', 'XVe-XVIe siècles', 'Monde', 'Période des grands voyages océaniques européens.', 'period', 'À quelle période associe-t-on les grands voyages océaniques européens ?', 'Les XVe-XVIe siècles', '30012'),
		('Réforme protestante', 'XVIe siècle', 'Europe', 'Mouvement religieux lancé au début du XVIe siècle.', 'period', 'À quel siècle commence la Réforme protestante ?', 'Le XVIe siècle', '30013'),
		('Monarchie absolue en France', 'XVIIe siècle', 'France', 'Modèle politique associé notamment à Louis XIV.', 'period', 'À quel siècle associe-t-on surtout la monarchie absolue de Louis XIV ?', 'Le XVIIe siècle', '30014'),
		('Siècle des Lumières', 'XVIIIe siècle', 'Europe', 'Période intellectuelle majeure avant la Révolution française.', 'period', 'Quel siècle est appelé le siècle des Lumières ?', 'Le XVIIIe siècle', '30015'),
		('Révolution française', '1789-1799', 'France', 'Période révolutionnaire qui transforme la France.', 'period', 'Quelle période française s''étend de 1789 à 1799 ?', 'La Révolution française', '30016'),
		('Consulat', '1799-1804', 'France', 'Régime français dirigé par Bonaparte avant l''Empire.', 'period', 'Quel régime français précède le Premier Empire de Napoléon ?', 'Le Consulat', '30017'),
		('Premier Empire', '1804-1815', 'France', 'Régime impérial de Napoléon Ier.', 'period', 'Quel régime français correspond au règne de Napoléon Ier ?', 'Le Premier Empire', '30018'),
		('Restauration', '1814-1830', 'France', 'Retour des Bourbons après Napoléon.', 'period', 'Quelle période française marque le retour des Bourbons après Napoléon ?', 'La Restauration', '30019'),
		('Monarchie de Juillet', '1830-1848', 'France', 'Régime monarchique de Louis-Philippe.', 'period', 'Quel régime français règne de 1830 à 1848 ?', 'La Monarchie de Juillet', '30020'),
		('Deuxième République', '1848-1852', 'France', 'Régime républicain né de la révolution de 1848.', 'period', 'Quelle République française naît en 1848 ?', 'La Deuxième République', '30021'),
		('Second Empire', '1852-1870', 'France', 'Régime impérial de Napoléon III.', 'period', 'Quel régime français est dirigé par Napoléon III ?', 'Le Second Empire', '30022'),
		('Troisième République', '1870-1940', 'France', 'Régime républicain durable avant 1940.', 'period', 'Quelle République française dure de 1870 à 1940 ?', 'La Troisième République', '30023'),
		('Belle Époque', 'environ 1871-1914', 'France et Europe', 'Période de paix et de transformations avant 1914.', 'period', 'Comment appelle-t-on souvent la période européenne précédant 1914 ?', 'La Belle Époque', '30024'),
		('Première Guerre mondiale', '1914-1918', 'Monde', 'Premier conflit mondial du XXe siècle.', 'period', 'Quelle guerre se déroule de 1914 à 1918 ?', 'La Première Guerre mondiale', '30025'),
		('Entre-deux-guerres', '1918-1939', 'Europe', 'Période située entre les deux guerres mondiales.', 'period', 'Comment appelle-t-on la période entre 1918 et 1939 ?', 'L''entre-deux-guerres', '30026'),
		('Seconde Guerre mondiale', '1939-1945', 'Monde', 'Conflit mondial majeur du XXe siècle.', 'period', 'Quelle guerre se déroule de 1939 à 1945 ?', 'La Seconde Guerre mondiale', '30027'),
		('Régime de Vichy', '1940-1944', 'France', 'Régime français pendant l''Occupation.', 'period', 'Quel régime français existe de 1940 à 1944 ?', 'Le régime de Vichy', '30028'),
		('Quatrième République', '1946-1958', 'France', 'Régime français de l''après-guerre avant 1958.', 'period', 'Quelle République française précède la Cinquième République ?', 'La Quatrième République', '30029'),
		('Cinquième République', 'depuis 1958', 'France', 'Régime politique français actuel.', 'date', 'En quelle année commence la Cinquième République ?', '1958', '30030'),
		('Guerre froide', '1947-1991', 'Monde', 'Opposition durable entre États-Unis et URSS.', 'period', 'Quelle période oppose principalement les États-Unis et l''URSS après 1945 ?', 'La Guerre froide', '30031'),
		('Trente Glorieuses', '1945-1975', 'France', 'Période de forte croissance économique après 1945.', 'period', 'Comment appelle-t-on la période de croissance française de 1945 à 1975 ?', 'Les Trente Glorieuses', '30032'),
		('Décolonisation', 'surtout 1945-1970', 'Monde', 'Période d''indépendance de nombreuses colonies.', 'period', 'Quelle période voit l''indépendance de nombreuses colonies après 1945 ?', 'La décolonisation', '30033'),
		('Construction européenne', 'depuis 1951', 'Europe', 'Processus politique et économique d''intégration européenne.', 'period', 'Quel processus européen commence avec la CECA puis les traités européens ?', 'La construction européenne', '30034'),
		('Guerre du Vietnam', '1955-1975', 'Vietnam', 'Conflit majeur de la guerre froide en Asie.', 'period', 'Quelle guerre d''Asie du Sud-Est se termine en 1975 ?', 'La guerre du Vietnam', '30035'),
		('Mai 68', '1968', 'France', 'Mouvement social et étudiant français.', 'date', 'En quelle année a lieu Mai 68 en France ?', '1968', '30036'),
		('Révolution industrielle', 'XVIIIe-XIXe siècles', 'Europe', 'Transformation économique et technique majeure.', 'period', 'À quelle période associe-t-on la Révolution industrielle en Europe ?', 'Les XVIIIe-XIXe siècles', '30037'),
		('Guerre de Sécession', '1861-1865', 'États-Unis', 'Guerre civile américaine.', 'period', 'Quelle guerre américaine se déroule de 1861 à 1865 ?', 'La guerre de Sécession', '30038'),
		('Guerre d''Algérie', '1954-1962', 'Algérie et France', 'Conflit de décolonisation franco-algérien.', 'period', 'Quelle guerre se déroule de 1954 à 1962 entre la France et l''Algérie ?', 'La guerre d''Algérie', '30039'),
		('Chute du mur de Berlin', '1989', 'Allemagne', 'Événement symbolique de la fin de la guerre froide.', 'date', 'En quelle année tombe le mur de Berlin ?', '1989', '30040'),
		('Dissolution de l''URSS', '1991', 'URSS', 'Fin officielle de l''Union soviétique.', 'date', 'En quelle année l''URSS disparaît-elle officiellement ?', '1991', '30041'),
		('Traité de Maastricht', '1992', 'Europe', 'Traité qui prépare l''Union européenne.', 'date', 'En quelle année est signé le traité de Maastricht ?', '1992', '30042'),
		('Empire byzantin', '395-1453', 'Méditerranée orientale', 'Empire romain d''Orient jusqu''à la chute de Constantinople.', 'period', 'Quel empire dure jusqu''à la chute de Constantinople en 1453 ?', 'L''Empire byzantin', '30043'),
		('Califat abbasside', '750-1258', 'Moyen-Orient', 'Grande dynastie du monde musulman médiéval.', 'period', 'Quel califat règne depuis Bagdad à partir de 750 ?', 'Le califat abbasside', '30044'),
		('Dynastie capétienne', '987-1792', 'France', 'Grande dynastie royale française.', 'period', 'Quelle dynastie royale française commence avec Hugues Capet ?', 'La dynastie capétienne', '30045'),
		('Croisades', '1095-1291', 'Méditerranée orientale', 'Expéditions religieuses et militaires médiévales.', 'period', 'Comment appelle-t-on les expéditions médiévales vers la Terre sainte ?', 'Les croisades', '30046'),
		('Guerre de Trente Ans', '1618-1648', 'Europe', 'Grand conflit européen du XVIIe siècle.', 'period', 'Quelle guerre européenne se termine par les traités de Westphalie ?', 'La guerre de Trente Ans', '30047'),
		('Révolution américaine', '1775-1783', 'Amérique du Nord', 'Processus d''indépendance des États-Unis.', 'period', 'Quelle révolution mène à l''indépendance des États-Unis ?', 'La Révolution américaine', '30048'),
		('Révolution russe', '1917', 'Russie', 'Révolution qui renverse le tsarisme puis porte les bolcheviks au pouvoir.', 'date', 'En quelle année a lieu la Révolution russe ?', '1917', '30049'),
		('Apartheid en Afrique du Sud', '1948-1991', 'Afrique du Sud', 'Système légal de ségrégation raciale.', 'period', 'Quel système de ségrégation est aboli progressivement en Afrique du Sud ?', 'L''apartheid', '30050')
	) as values_table(title, period_label, location_label, short_summary, prompt_type, question, answer, sort_order)
), all_seed_items as (
	select culture_items.id, culture_items.collection, culture_items.title
	from public.culture_items
	where culture_items.category = 'history'
		and culture_items.collection in ('historical_events', 'historical_figures', 'historical_dates')
), source_prompts as (
	select
		'historical_events'::text as collection,
		source_events.title as item_title,
		'forward'::text as prompt_direction,
		source_events.prompt_type,
		('Quelle date ou période associer à : ' || source_events.title || ' ?')::text as question,
		source_events.date_answer as answer,
		array[]::text[] as answer_aliases,
		array[]::text[] as choices,
		10 as sort_order
	from source_events
	union all
	select
		'historical_events',
		source_events.title,
		'reverse',
		'general',
		('Quel événement historique correspond à ce repère : ' || source_events.reverse_clue || ' ?'),
		source_events.title,
		array[]::text[],
		array[]::text[],
		20
	from source_events
	union all
	select
		'historical_figures',
		source_figures.title,
		'forward',
		'general',
		('Qui était ' || source_figures.title || ' ?'),
		source_figures.role_answer,
		array[]::text[],
		array[]::text[],
		10
	from source_figures
	union all
	select
		'historical_figures',
		source_figures.title,
		'reverse',
		'person',
		('Quel personnage historique associer à ce repère : ' || source_figures.reverse_clue || ' ?'),
		source_figures.title,
		array[]::text[],
		array[]::text[],
		20
	from source_figures
	union all
	select
		'historical_dates',
		source_dates.title,
		'standard',
		source_dates.prompt_type,
		source_dates.question,
		source_dates.answer,
		array[]::text[],
		array[]::text[],
		10
	from source_dates
)
insert into public.culture_prompts (
	item_id,
	prompt_direction,
	prompt_type,
	question,
	answer,
	answer_aliases,
	choices,
	sort_order
)
select
	all_seed_items.id,
	source_prompts.prompt_direction,
	source_prompts.prompt_type,
	source_prompts.question,
	source_prompts.answer,
	source_prompts.answer_aliases,
	source_prompts.choices,
	source_prompts.sort_order
from source_prompts
join all_seed_items
	on all_seed_items.collection = source_prompts.collection
	and all_seed_items.title = source_prompts.item_title
where not exists (
	select 1
	from public.culture_prompts existing_prompts
	where existing_prompts.item_id = all_seed_items.id
		and existing_prompts.prompt_direction = source_prompts.prompt_direction
		and existing_prompts.prompt_type = source_prompts.prompt_type
);

-- Requêtes de contrôle utiles après application réelle :
-- select collection, count(*) from public.culture_items where category = 'history' and collection in ('historical_events', 'historical_figures', 'historical_dates') group by collection order by collection;
-- select culture_items.collection, count(*) from public.culture_prompts join public.culture_items on culture_items.id = culture_prompts.item_id where culture_items.category = 'history' and culture_items.collection in ('historical_events', 'historical_figures', 'historical_dates') group by culture_items.collection order by culture_items.collection;
-- select culture_prompts.prompt_type, count(*) from public.culture_prompts join public.culture_items on culture_items.id = culture_prompts.item_id where culture_items.category = 'history' and culture_items.collection in ('historical_events', 'historical_figures', 'historical_dates') group by culture_prompts.prompt_type order by culture_prompts.prompt_type;
-- select question, count(*) from public.culture_prompts join public.culture_items on culture_items.id = culture_prompts.item_id where culture_items.category = 'history' and culture_items.collection in ('historical_events', 'historical_figures', 'historical_dates') group by question having count(*) > 1 order by count(*) desc, question;
