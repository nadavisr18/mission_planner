const iconhtml = `<table><tr><td class="icon-text">$waypoint-type$<td></tr>
                  <tr><td class="icon-symbol">$icon$<td></tr>
                  <tr><td class="icon-text">$waypoint-name$<td></tr></table>`;

const grouphtml = `<table><tr><td class="icon-text">$waypoint-type$<td></tr>
                  <tr><td class="spawn-symbol">$icon$<td></tr>
                  <tr><td class="icon-text">$aircraft$<td></tr></table>`;

const iconHtmls = {
    "none": '<div class="icon-background icon-symbol"><i class="fas fa-play" style="padding-left: 4px; padding-top: 2px; font-size: 20px; color: #212d3c;"></i><div>',
    "anchor": '<div class="icon-background icon-symbol"><i class="fas fa-anchor" style="padding-left: 0px; padding-top: 2px; font-size: 20px; color: #212d3c;"></i><div>',
    "route": '<div class="icon-background icon-symbol"><i class="fas fa-play" style="padding-left: 4px; padding-top: 2px; font-size: 20px; color: #212d3c;"></i><div>',
    "ip": '<div class="icon-background icon-symbol"><i class="fas fa-sign-in-alt" style="padding-left: 1px; padding-top: 2px; font-size: 20px; color: #212d3c;"></i><div>',
    "target": '<div class="icon-background icon-symbol"><i class="fas fa-crosshairs" style="padding-left: 0px; padding-top: 0px; font-size: 23px; color: #212d3c;"></i><div>',
    "fac": '<div class="icon-background icon-symbol"><i class="fas fa-eye" style="padding-left: 0px; padding-top: 2px; font-size: 20px; color: #212d3c;"></i><div>',
    "sam": '<div class="icon-background icon-symbol"><i class="fas fa-exclamation-circle" style="padding-left: 0px; padding-top: 0px; font-size: 23px; color: #212d3c;"></i><div>',
    "home base": '<div class="icon-background icon-symbol"><i class="fas fa-home" style="padding-left: 0px; padding-top: 2px; font-size: 20px; color: #212d3c;"></i><div>',
    "tanker": '<div class="icon-background icon-symbol"><i class="fas fa-battery-quarter" style="padding-left: 0px; padding-top: 2px; font-size: 20px; color: #212d3c;"></i><div>',
    "contested Area": '<div class="icon-background icon-symbol"><i class="fab fa-fort-awesome" style="padding-left: 1px; padding-top: 2px; font-size: 20px; color: #212d3c;"></i><div>',
    "bullseye": '<div class="icon-background icon-symbol"><i class="fas fa-bullseye" style="padding-left: 1px; padding-top: 2px; font-size: 21px; color: #212d3c;"></i><div>',
    "airport": '<div class="icon-background icon-symbol"><i class="fas fa-fighter-jet" style="padding-left: 0px; padding-top: 2px; font-size: 20px; color: #212d3c;"></i><div>'
}

const iconSelectedHtmls = {
    "none": '<div class="icon-background-selected icon-symbol"><i class="fas fa-play" style="padding-left: 4px; padding-top: 2px; font-size: 20px; color: #EEEEEE;"></i><div>',
    "anchor": '<div class="icon-background-selected icon-symbol"><i class="fas fa-anchor" style="padding-left: 0px; padding-top: 2px; font-size: 20px; color: #EEEEEE;"></i><div>',
    "route": '<div class="icon-background-selected icon-symbol"><i class="fas fa-play" style="padding-left: 4px; padding-top: 2px; font-size: 20px; color: #EEEEEE;"></i><div>',
    "ip": '<div class="icon-background-selected icon-symbol"><i class="fas fa-sign-in-alt" style="padding-left: 1px; padding-top: 2px; font-size: 20px; color: #EEEEEE;"></i><div>',
    "target": '<div class="icon-background-selected icon-symbol"><i class="fas fa-crosshairs" style="padding-left: 0px; padding-top: 0px; font-size: 23px; color: #EEEEEE;"></i><div>',
    "fac": '<div class="icon-background-selected icon-symbol"><i class="fas fa-eye" style="padding-left: 0px; padding-top: 2px; font-size: 20px; color: #EEEEEE;"></i><div>',
    "sam": '<div class="icon-background-selected icon-symbol"><i class="fas fa-exclamation-circle" style="padding-left: 1px; padding-top: 1px; font-size: 23px; color: #EEEEEE;"></i><div>',
    "home base": '<div class="icon-background-selected icon-symbol"><i class="fas fa-home" style="padding-left: 0px; padding-top: 2px; font-size: 20px; color: #EEEEEE;"></i><div>',
    "tanker": '<div class="icon-background-selected icon-symbol"><i class="fas fa-battery-quarter" style="padding-left: 0px; padding-top: 2px; font-size: 20px; color: #EEEEEE;"></i><div>',
    "contested Area": '<div class="icon-background-selected icon-symbol"><i class="fab fa-fort-awesome" style="padding-left: 2px; padding-top: 2px; font-size: 20px; color: #EEEEEE;"></i><div>',
    "bullseye": '<div class="icon-background-selected icon-symbol"><i class="fas fa-bullseye" style="padding-left: 1px; padding-top: 2px; font-size: 21px; color: #EEEEEE;"></i><div>',
    "airport": '<div class="icon-background-selected icon-symbol"><i class="fas fa-fighter-jet" style="padding-left: 0px; padding-top: 2px; font-size: 20px; color: #EEEEEE;"></i><div>'
}
