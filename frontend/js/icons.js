const iconhtml = `<table><tr><td class="icon-text">$waypoint-type$<td></tr>
                  <tr><td class="icon-symbol">$icon$<td></tr>
                  <tr><td class="icon-text">$waypoint-name$<td></tr></table>`;

const grouphtml = `<table><tr><td class="icon-text">$waypoint-type$<td></tr>
                  <tr><td class="spawn-symbol">$icon$<td></tr>
                  <tr><td class="icon-text">$aircraft$<td></tr></table></div>`;

const groupSelectedHtml = `<table><tr><td class="icon-text">$waypoint-type$<td></tr>
                  <tr><td class="spawn-symbol">$icon$<td></tr>
                  <tr><td class="icon-text">$aircraft$<td></tr></table><div class="spinner-group"></div>`;

const iconHtmls = {
    "none":             '<div class="icon-background icon-symbol"><i class="fas fa-play"                style="padding-left: 4px; padding-top: 2px; font-size: 20px; color: $color$;"></i><div>',
    "anchor":           '<div class="icon-background icon-symbol"><i class="fas fa-anchor"              style="padding-left: 0px; padding-top: 2px; font-size: 20px; color: $color$;"></i><div>',
    "route":            '<div class="icon-background icon-symbol"><i class="fas fa-play"                style="padding-left: 4px; padding-top: 2px; font-size: 20px; color: $color$;"></i><div>',
    "ip":               '<div class="icon-background icon-symbol"><i class="fas fa-sign-in-alt"         style="padding-left: 1px; padding-top: 2px; font-size: 20px; color: $color$;"></i><div>',
    "target":           '<div class="icon-background icon-symbol"><i class="fas fa-crosshairs"          style="padding-left: 0px; padding-top: 0px; font-size: 23px; color: $color$;"></i><div>',
    "fac":              '<div class="icon-background icon-symbol"><i class="fas fa-eye"                 style="padding-left: 0px; padding-top: 2px; font-size: 20px; color: $color$;"></i><div>',
    "sam":              '<div class="icon-background icon-symbol"><i class="fas fa-exclamation-circle"  style="padding-left: 0px; padding-top: 0px; font-size: 23px; color: $color$;"></i><div>',
    "home base":        '<div class="icon-background icon-symbol"><i class="fas fa-home"                style="padding-left: 0px; padding-top: 2px; font-size: 20px; color: $color$;"></i><div>',
    "tanker":           '<div class="icon-background icon-symbol"><i class="fas fa-battery-quarter"     style="padding-left: 0px; padding-top: 2px; font-size: 20px; color: $color$;"></i><div>',
    "contested area":   '<div class="icon-background icon-symbol"><i class="fab fa-fort-awesome"        style="padding-left: 1px; padding-top: 2px; font-size: 20px; color: $color$;"></i><div>',
    "bullseye":         '<div class="icon-background icon-symbol"><i class="fas fa-bullseye"            style="padding-left: 1px; padding-top: 2px; font-size: 21px; color: $color$;"></i><div>',
    "airport":          '<div class="icon-background icon-symbol"><i class="fas fa-fighter-jet"         style="padding-left: 0px; padding-top: 2px; font-size: 20px; color: $color$;"></i><div>'
}

const iconSelectedHtmls = {
    "none":             '<div class="icon-background-selected icon-symbol"><i class="fas fa-play"                style="padding-left: 4px; padding-top: 2px; font-size: 20px; color: $color$;"></i></div><div class = "spinner-in"></div>',
    "anchor":           '<div class="icon-background-selected icon-symbol"><i class="fas fa-anchor"              style="padding-left: 0px; padding-top: 2px; font-size: 20px; color: $color$;"></i></div><div class = "spinner-in"></div>',
    "route":            '<div class="icon-background-selected icon-symbol"><i class="fas fa-play"                style="padding-left: 4px; padding-top: 2px; font-size: 20px; color: $color$;"></i></div><div class = "spinner-in"></div>',
    "ip":               '<div class="icon-background-selected icon-symbol"><i class="fas fa-sign-in-alt"         style="padding-left: 1px; padding-top: 2px; font-size: 20px; color: $color$;"></i></div><div class = "spinner-in"></div>',
    "target":           '<div class="icon-background-selected icon-symbol"><i class="fas fa-crosshairs"          style="padding-left: 0px; padding-top: 0px; font-size: 23px; color: $color$;"></i></div><div class = "spinner-in"></div>',
    "fac":              '<div class="icon-background-selected icon-symbol"><i class="fas fa-eye"                 style="padding-left: 0px; padding-top: 2px; font-size: 20px; color: $color$;"></i></div><div class = "spinner-in"></div>',
    "sam":              '<div class="icon-background-selected icon-symbol"><i class="fas fa-exclamation-circle"  style="padding-left: 1px; padding-top: 1px; font-size: 23px; color: $color$;"></i></div><div class = "spinner-in"></div>',
    "home base":        '<div class="icon-background-selected icon-symbol"><i class="fas fa-home"                style="padding-left: 0px; padding-top: 2px; font-size: 20px; color: $color$;"></i></div><div class = "spinner-in"></div>',
    "tanker":           '<div class="icon-background-selected icon-symbol"><i class="fas fa-battery-quarter"     style="padding-left: 0px; padding-top: 2px; font-size: 20px; color: $color$;"></i></div><div class = "spinner-in"></div>',
    "contested area":   '<div class="icon-background-selected icon-symbol"><i class="fab fa-fort-awesome"        style="padding-left: 2px; padding-top: 2px; font-size: 20px; color: $color$;"></i></div><div class = "spinner-in"></div>',
    "bullseye":         '<div class="icon-background-selected icon-symbol"><i class="fas fa-bullseye"            style="padding-left: 1px; padding-top: 2px; font-size: 21px; color: $color$;"></i></div><div class = "spinner-in"></div>',
    "airport":          '<div class="icon-background-selected icon-symbol"><i class="fas fa-fighter-jet"         style="padding-left: 0px; padding-top: 2px; font-size: 20px; color: $color$;"></i></div><div class = "spinner-in"></div>'
}
