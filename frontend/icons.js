const iconhtml = `<table><tr><td class="icon-text">$waypoint-type$<td></tr>
                  <tr><td class="icon-symbol">$icon$<td></tr>
                  <tr><td class="icon-text">$waypoint-name$<td></tr></table>`;

const grouphtml = `<table><tr><td class="icon-text">$waypoint-type$<td></tr>
                  <tr><td class="spawn-symbol">$icon$<td></tr>
                  <tr><td class="icon-text">$aircraft$<td></tr></table>`;

const iconHtmls = {
    "Anchor": '<div class="icon-background icon-symbol"><i class="fas fa-anchor" style="padding-left: 0px; padding-top: 2px; font-size: 20px; color: #212d3c;"></i><div>',
    "Route": '<div class="icon-background icon-symbol"><i class="fas fa-play" style="padding-left: 4px; padding-top: 2px; font-size: 20px; color: #212d3c;"></i><div>',
    "IP": '<div class="icon-background icon-symbol"><i class="fas fa-sign-in-alt" style="padding-left: 1px; padding-top: 2px; font-size: 20px; color: #212d3c;"></i><div>',
    "Target": '<div class="icon-background icon-symbol"><i class="fas fa-crosshairs" style="padding-left: 0px; padding-top: 0px; font-size: 23px; color: #212d3c;"></i><div>',
    "FAC": '<div class="icon-background icon-symbol"><i class="fas fa-eye" style="padding-left: 0px; padding-top: 2px; font-size: 20px; color: #212d3c;"></i><div>',
    "SAM": '<div class="icon-background icon-symbol"><i class="fas fa-exclamation-circle" style="padding-left: 0px; padding-top: 0px; font-size: 23px; color: #212d3c;"></i><div>',
    "Home Base": '<div class="icon-background icon-symbol"><i class="fas fa-home" style="padding-left: 0px; padding-top: 2px; font-size: 20px; color: #212d3c;"></i><div>',
    "Tanker": '<div class="icon-background icon-symbol"><i class="fas fa-battery-quarter" style="padding-left: 0px; padding-top: 2px; font-size: 20px; color: #212d3c;"></i><div>',
    "Contested Area": '<div class="icon-background icon-symbol"><i class="fab fa-fort-awesome" style="padding-left: 1px; padding-top: 2px; font-size: 20px; color: #212d3c;"></i><div>',
    "Bullseye": '<div class="icon-background icon-symbol"><i class="fas fa-bullseye" style="padding-left: 1px; padding-top: 2px; font-size: 21px; color: #212d3c;"></i><div>',
    "Airport": '<div class="icon-background icon-symbol"><i class="fas fa-fighter-jet" style="padding-left: 0px; padding-top: 2px; font-size: 20px; color: #212d3c;"></i><div>'
}

const iconSelectedHtmls = {
    "Anchor": '<div class="icon-background-selected icon-symbol"><i class="fas fa-anchor" style="padding-left: 0px; padding-top: 2px; font-size: 20px; color: #EEEEEE;"></i><div>',
    "Route": '<div class="icon-background-selected icon-symbol"><i class="fas fa-play" style="padding-left: 4px; padding-top: 2px; font-size: 20px; color: #EEEEEE;"></i><div>',
    "IP": '<div class="icon-background-selected icon-symbol"><i class="fas fa-sign-in-alt" style="padding-left: 1px; padding-top: 2px; font-size: 20px; color: #EEEEEE;"></i><div>',
    "Target": '<div class="icon-background-selected icon-symbol"><i class="fas fa-crosshairs" style="padding-left: 0px; padding-top: 0px; font-size: 23px; color: #EEEEEE;"></i><div>',
    "FAC": '<div class="icon-background-selected icon-symbol"><i class="fas fa-eye" style="padding-left: 0px; padding-top: 2px; font-size: 20px; color: #EEEEEE;"></i><div>',
    "SAM": '<div class="icon-background-selected icon-symbol"><i class="fas fa-exclamation-circle" style="padding-left: 1px; padding-top: 1px; font-size: 23px; color: #EEEEEE;"></i><div>',
    "Home Base": '<div class="icon-background-selected icon-symbol"><i class="fas fa-home" style="padding-left: 0px; padding-top: 2px; font-size: 20px; color: #EEEEEE;"></i><div>',
    "Tanker": '<div class="icon-background-selected icon-symbol"><i class="fas fa-battery-quarter" style="padding-left: 0px; padding-top: 2px; font-size: 20px; color: #EEEEEE;"></i><div>',
    "Contested Area": '<div class="icon-background-selected icon-symbol"><i class="fab fa-fort-awesome" style="padding-left: 2px; padding-top: 2px; font-size: 20px; color: #EEEEEE;"></i><div>',
    "Bullseye": '<div class="icon-background-selected icon-symbol"><i class="fas fa-bullseye" style="padding-left: 1px; padding-top: 2px; font-size: 21px; color: #EEEEEE;"></i><div>',
    "Airport": '<div class="icon-background-selected icon-symbol"><i class="fas fa-fighter-jet" style="padding-left: 0px; padding-top: 2px; font-size: 20px; color: #EEEEEE;"></i><div>'
}
