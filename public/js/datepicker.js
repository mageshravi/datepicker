"use strict";var _createClass=function(){function e(e,t){for(var s=0;s<t.length;s++){var a=t[s];a.enumerable=a.enumerable||false;a.configurable=true;if("value"in a)a.writable=true;Object.defineProperty(e,a.key,a)}}return function(t,s,a){if(s)e(t.prototype,s);if(a)e(t,a);return t}}();function _classCallCheck(e,t){if(!(e instanceof t)){throw new TypeError("Cannot call a class as a function")}}var EVENT_DATE_PICKER_YEAR_UPDATE="date-picker:year-update";var EVENT_DATE_PICKER_MONTH_UPDATE="date-picker:month-update";var EVENT_DATE_PICKER_FORCE_EDIT="date-picker:force-edit";var EVENT_DATE_PICKER_ENTER="date-picker:enter";var EVENT_DATE_PICKER_EXIT="date-picker:exit";var DatePicker=function(){_createClass(e,null,[{key:"FORMAT_DATE",get:function e(){return"date"}},{key:"FORMAT_DATETIME",get:function e(){return"datetime"}}]);function e(t){_classCallCheck(this,e);this.defaults={};this.cssSelectors={dp:".c-date-picker",dpFocused:".c-date-picker--focused",dpDisplay:".c-date-picker__display",dpDropDown:".c-date-picker__drop-down",dpYearWrapper:".c-date-picker__year-wrapper",dpMonthWrapper:".c-date-picker__month-wrapper",dpMonth:".c-date-picker__month",dpCalWrapper:".c-date-picker__cal-wrapper",dpWeekWrapper:".c-date-picker__week-wrapper",dpDate:".c-date-picker__date",dpTimeWrapper:".c-date-picker__time-wrapper",dpSelectMenuLabel:".c-date-picker__select-label",dpSelectMenu:".c-date-picker__select",dpOverlay:".c-date-picker__overlay",focus:".focus",active:".active",empty:".empty",disabled:".disabled",jsPrevYear:".js-date-picker-prev-year",jsYear:".js-date-picker-year",jsNextYear:".js-date-picker-next-year",jsHour:".js-date-picker-hour",jsMinute:".js-date-picker-minute",jsMeridian:".js-date-picker-meridian"};this.$input=t;this.parseInputAttrs();this.setup();this.bindUIActions()}_createClass(e,[{key:"parseInputAttrs",value:function t(){var s=this.$input.data("min-date");var a=c(s);if(!isNaN(a)){this.defaults.minDate=a}var r=this.$input.data("max-date");if(r){var i=c(r);this.defaults.maxDate=isNaN(i)?null:i}if(this.defaults.minDate&&this.defaults.maxDate&&this.defaults.minDate>this.defaults.maxDate){console.log(this.$input.get(0));throw Error("min-date is greater than max-date")}var l=this.$input.val();var n=c(l);if(isNaN(n)){this.defaults.value=c("today")}else{this.defaults.value=n}var o=this.$input.data("format");if(!o){o=e.FORMAT_DATE}var h=[e.FORMAT_DATE,e.FORMAT_DATETIME];if(h.indexOf(o)!==-1){this.defaults.format=o}function c(e){var t=new Date;var s=new Date(t.getFullYear(),t.getMonth(),t.getDate()+1);var a=new Date(t.getFullYear(),t.getMonth(),t.getDate()-1);switch(e){case"yesterday":return a;case"today":return t;case"tomorrow":return s;default:return new Date(e)}}}},{key:"setup",value:function t(){var s=getClassNameFromSelector(this.cssSelectors.dp);var a=getClassNameFromSelector(this.cssSelectors.dpDisplay);var r=getClassNameFromSelector(this.cssSelectors.dpDropDown);this.$dp=$('<div class="'+s+'"></div>');this.$dp.insertAfter(this.$input);this.$dpDisplay=$('<input type="text" class="'+a+'" readonly>');var i=getFormattedDate(this.defaults.value);if(this.defaults.format===e.FORMAT_DATETIME){i=getFormattedDateTime(this.defaults.value,true)}this.$dpDisplay.val(i);this.$dp.append(this.$dpDisplay);var l=$('<div class="'+r+'"></div>');this.$dp.append(l);this.$dpYearWrapper=$(this.getYearWrapperHtml());l.append(this.$dpYearWrapper);this.$dpMonthWrapper=$(this.getMonthWrapperHtml());l.append(this.$dpMonthWrapper);this.$dpCalWrapper=$(this.getCalWrapperHtml());l.append(this.$dpCalWrapper);if(this.defaults.format===e.FORMAT_DATETIME){this.$dpTimeWrapper=$(this.getTimeWrapperHtml());l.append(this.$dpTimeWrapper)}this.$input.attr("type","hidden");this.$dp.append(this.$input);this.$dpOverlay=$(this.getOverlayHtml());this.$dp.append(this.$dpOverlay);this.$year=this.$dp.find(this.cssSelectors.jsYear);this.$hour=this.$dp.find(this.cssSelectors.jsHour);this.$minute=this.$dp.find(this.cssSelectors.jsMinute);this.$meridian=this.$dp.find(this.cssSelectors.jsMeridian)}},{key:"bindUIActions",value:function e(){this.$dp.on("focus",this.show.bind(this));this.$dpDisplay.on("focus",this.show.bind(this));this.$dpOverlay.on("click",this.hide.bind(this));this.$dp.on("click",this.cssSelectors.jsPrevYear,function(){"use strict";this.$year.val(parseInt(this.$year.val())-1);this.$dp.trigger(EVENT_DATE_PICKER_YEAR_UPDATE)}.bind(this));this.$dp.on("click",this.cssSelectors.jsNextYear,function(){"use strict";this.$year.val(parseInt(this.$year.val())+1);this.$dp.trigger(EVENT_DATE_PICKER_YEAR_UPDATE)}.bind(this));this.$year.on("change",function(e){this.updateMonth()}.bind(this));var t=getClassNameFromSelector(this.cssSelectors.disabled);this.$year.on("keyup",function(e){if(e.keyCode!==13){this.$dpMonthWrapper.addClass(t);this.$dpCalWrapper.addClass(t);return}this.$dpMonthWrapper.removeClass(t);this.$dpCalWrapper.removeClass(t);this.$dpMonthWrapper.focus();this.navigateMonthsWithKeys()}.bind(this));this.$year.on("blur",function(e){this.$dpMonthWrapper.focus()}.bind(this));this.$dp.on(EVENT_DATE_PICKER_YEAR_UPDATE,this.updateMonth.bind(this));this.$dp.on(EVENT_DATE_PICKER_MONTH_UPDATE,this.updateCal.bind(this));this.$dp.on("keyup",this.cssSelectors.dpMonthWrapper,this.navigateMonthsWithKeys.bind(this));this.$dp.on("click",this.cssSelectors.dpMonth,this.selectMonth.bind(this));this.$dp.on("keyup",this.cssSelectors.dpCalWrapper,this.navigateDateWithKeys.bind(this));this.$dp.on("click",this.cssSelectors.dpDate,this.selectDate.bind(this));this.$dp.on(EVENT_DATE_PICKER_FORCE_EDIT,this.forceEditHandler.bind(this));this.$dp.on("click",this.cssSelectors.dpTimeWrapper+" button",this.setTimeAndHide.bind(this));$("body").on(EVENT_DATE_PICKER_ENTER,function(e){if(e.target!==this.$dp.get(0)){this.$dp.removeAttr("tabindex");this.$dpDisplay.attr("disabled",true)}}.bind(this));$("body").on(EVENT_DATE_PICKER_EXIT,function(e){if(e.target!==this.$dp.get(0)){this.$dp.attr("tabindex","0");this.$dpDisplay.removeAttr("disabled")}}.bind(this))}},{key:"show",value:function e(){this.reset();this.$dp.addClass(getClassNameFromSelector(this.cssSelectors.dpFocused));$("html,body").css({overflow:"hidden"});this.$dp.trigger(EVENT_DATE_PICKER_ENTER)}},{key:"hide",value:function e(){this.$dp.removeClass(getClassNameFromSelector(this.cssSelectors.dpFocused));$("html,body").css({overflow:"auto"});this.$dp.trigger(EVENT_DATE_PICKER_EXIT);this.$dp.blur()}},{key:"forceEditHandler",value:function e(){this.show();this.$dp.focus()}},{key:"reset",value:function e(){this.$year.val(this.defaults.value.getFullYear());this.$dpMonthWrapper.remove();this.$dpMonthWrapper=$(this.getMonthWrapperHtml());this.$dpMonthWrapper.insertAfter(this.$dpYearWrapper);this.$dpCalWrapper.remove();this.$dpCalWrapper=$(this.getCalWrapperHtml());this.$dpCalWrapper.insertAfter(this.$dpMonthWrapper)}},{key:"updateMonth",value:function e(){var t=this.$dpMonthWrapper;this.$dpMonthWrapper=$(this.getMonthWrapperHtml());t.replaceWith(this.$dpMonthWrapper);this.$dp.trigger(EVENT_DATE_PICKER_MONTH_UPDATE)}},{key:"updateCal",value:function e(){this.$dpCalWrapper.remove();this.$dpCalWrapper=$(this.getCalWrapperHtml());this.$dpCalWrapper.insertAfter(this.$dpMonthWrapper)}},{key:"navigateMonthsWithKeys",value:function e(t){var s=37;var a=38;var r=39;var i=40;var l=13;var n=getClassNameFromSelector(this.cssSelectors.focus);var o=getClassNameFromSelector(this.cssSelectors.disabled);if(this.$dpMonthWrapper.hasClass(o)){return}var h=this.$dp.find(this.cssSelectors.dpMonth+this.cssSelectors.focus);if(!h.length){h=this.$dp.find(this.cssSelectors.dpMonth+this.cssSelectors.active);h.addClass(n)}if(!h.length){h=this.$dp.find(this.cssSelectors.dpMonth+":not("+this.cssSelectors.disabled+")").first();h.addClass(n)}if(!t){return}var c;switch(t.keyCode){case s:c=h.prev();if(!c.length){c=h.siblings(":last")}if(c.hasClass(o)){c=h.siblings(":not("+this.cssSelectors.disabled+")").last()}c.addClass(n).siblings().removeClass(n);break;case r:c=h.next();if(!c.length){c=h.siblings(":first")}if(c.hasClass(o)){c=h.siblings(":not("+this.cssSelectors.disabled+")").first()}c.addClass(n).siblings().removeClass(n);break;case a:case i:var d=this.$dp.find(this.cssSelectors.dpMonth);var p=d.index(h);if(p<6){c=d.eq(p+6)}else{c=d.eq(p-6)}if(!c.hasClass(o)){c.addClass(n).siblings().removeClass(n)}break;case l:h.click();this.$dpCalWrapper.focus();this.navigateDateWithKeys()}}},{key:"navigateDateWithKeys",value:function e(t){var s=37;var a=38;var r=39;var i=40;var l=13;var n=this.$dp.find(this.cssSelectors.dpDate).filter(":not("+this.cssSelectors.empty+")");var o=getClassNameFromSelector(this.cssSelectors.focus);var h=getClassNameFromSelector(this.cssSelectors.disabled);if(this.$dpCalWrapper.hasClass(h)){return}var c=n.filter(this.cssSelectors.focus);if(!c.length){c=n.filter(":not("+this.cssSelectors.disabled+")").first();c.addClass(o)}if(!t){return}var d=n.index(c);var p;switch(t.keyCode){case s:if(d===0){p=n.filter(":not("+this.cssSelectors.disabled+")").last()}else{p=n.eq(d-1)}if(p.hasClass(h)){p=n.filter(":not("+this.cssSelectors.disabled+")").last()}p.addClass(o).siblings().removeClass(o);break;case r:if(d===n.length-1){p=n.filter(":not("+this.cssSelectors.disabled+")").first()}else{p=n.eq(d+1)}if(p.hasClass(h)){p=n.filter(":not("+this.cssSelectors.disabled+")").first()}p.addClass(o).siblings().removeClass(o);break;case a:if(d<=6){return}p=n.eq(d-7);if(!p.length){return}if(p.hasClass(h)){return}p.addClass(o).siblings().removeClass(o);break;case i:if(d>=n.length-7){return}p=n.eq(d+7);if(!p.length){return}if(p.hasClass(h)){return}p.addClass(o).siblings().removeClass(o);break;case l:c.click();break}}},{key:"selectMonth",value:function e(t){var s=$(t.currentTarget);var a=getClassNameFromSelector(this.cssSelectors.disabled);if(s.hasClass(a)){return}var r=getClassNameFromSelector(this.cssSelectors.active);s.siblings("li").removeClass(r);s.addClass(r);this.$dp.trigger(EVENT_DATE_PICKER_MONTH_UPDATE)}},{key:"selectDate",value:function t(s){var a=$(s.currentTarget);var r=getClassNameFromSelector(this.cssSelectors.disabled);var i=getClassNameFromSelector(this.cssSelectors.empty);if(a.hasClass(r)||a.hasClass(i)){return}var l=getClassNameFromSelector(this.cssSelectors.active);a.siblings("li").removeClass(l);a.addClass(l);var n=this.$year.val();var o=this.getSelectedMonth();var h=parseInt(a.text());this.defaults.value=new Date(n,o,h);this.$dpDisplay.val(getFormattedDate(this.defaults.value));this.$input.val(getFormattedDate(this.defaults.value));var c=getClassNameFromSelector(this.cssSelectors.focus);$(this.cssSelectors.dpDate).removeClass(c);if(this.defaults.format===e.FORMAT_DATE){this.hide()}else if(this.defaults.format===e.FORMAT_DATETIME){this.$hour.focus()}}},{key:"setTimeAndHide",value:function e(){var t=this.$year.val();var s=this.getSelectedMonth();var a=this.getSelectedDate();var r=parseInt(this.$hour.val());var i=parseInt(this.$minute.val());var l=this.$meridian.val();if(r===""){this.$hour.focus()}else if(i===""){this.$minute.focus()}else if(l===""){this.$meridian.focus()}else{if(l==="pm"){r+=12}var n=new Date(t,s,a,r,i);if(isNaN(n)){console.log("Invalid date: year:"+t+" month:"+s+" date:"+a+" hour:"+r+" minute:"+i);return}this.$dpDisplay.val(getFormattedDateTime(n,true));this.$input.val(getFormattedDateTime(n));this.defaults.value=n;this.hide()}}},{key:"getYearWrapperHtml",value:function e(){var t=getClassNameFromSelector(this.cssSelectors.dpYearWrapper);var s=getClassNameFromSelector(this.cssSelectors.jsPrevYear);var a=getClassNameFromSelector(this.cssSelectors.jsYear);var r=getClassNameFromSelector(this.cssSelectors.jsNextYear);return['<div class="'+t+'">','<span class="'+s+' fa fa-caret-left"></span>','<input type="text" class="'+a+'" value="'+this.defaults.value.getFullYear()+'">','<span class="'+r+' fa fa-caret-right"></span>',"</div>"].join("")}},{key:"getMonthWrapperHtml",value:function e(){if(!this.$year){this.$year=this.$dp.find(this.cssSelectors.jsYear)}var t=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];var s=new Date(this.$year.val(),0,1);var a=s.getFullYear()===this.defaults.value.getFullYear();var r=this.defaults.value.getMonth();var i=0;if(this.defaults.minDate){if(s.getFullYear()<this.defaults.minDate.getFullYear()){i=12}else if(s.getFullYear()===this.defaults.minDate.getFullYear()){i=this.defaults.minDate.getMonth()}}var l=12;if(this.defaults.maxDate){if(s.getFullYear()>this.defaults.maxDate.getFullYear()){l=-1}else if(s.getFullYear()===this.defaults.maxDate.getFullYear()){l=this.defaults.maxDate.getMonth()}}var n=getClassNameFromSelector(this.cssSelectors.dpMonthWrapper);var o=getClassNameFromSelector(this.cssSelectors.dpMonth);var h=getClassNameFromSelector(this.cssSelectors.disabled);var c=getClassNameFromSelector(this.cssSelectors.active);var d=['<ul class="'+n+'" tabindex="0">'];for(var p=0;p<12;p++){var u=[o];if(p<i||p>l){u.push(h)}else if(a&&p===r){u.push(c)}var v=["<li",'data-month="'+p+'"','class="'+u.join(" ")+'"'];v.push(">"+t[p]+"</li>");d.push(v.join(" "))}d.push("</ul>");return d.join("")}},{key:"getCalWrapperHtml",value:function e(){var t=getClassNameFromSelector(this.cssSelectors.dpCalWrapper);var s=getClassNameFromSelector(this.cssSelectors.dpWeekWrapper);var a=getClassNameFromSelector(this.cssSelectors.dpDate);var r=getClassNameFromSelector(this.cssSelectors.disabled);var i=getClassNameFromSelector(this.cssSelectors.active);var l=getClassNameFromSelector(this.cssSelectors.empty);var n=['<div class="'+t+'" tabindex="0">'];var o=["S","M","T","W","T","F","S"];n.push('<ul class="'+s+'">');for(var h=0;h<7;h++){n.push('<li class="'+[a,l].join(" ")+'">'+o[h]+"</li>")}n.push("</ul>");n.push('<ul class="'+s+'">');var c=this.$year.val();var d=this.getSelectedMonth();if(d===-1){return}var p=new Date(c,d,1);var u=1;var v=32;var f=p.getFullYear()===this.defaults.value.getFullYear();var m=p.getMonth()===this.defaults.value.getMonth();var g=this.defaults.value.getDate();if(this.defaults.minDate){if(p.getFullYear()<this.defaults.minDate.getFullYear()){u=32}else if(p.getFullYear()===this.defaults.minDate.getFullYear()){if(p.getMonth()<this.defaults.minDate.getMonth()){u=32}else if(p.getMonth()===this.defaults.minDate.getMonth()){u=this.defaults.minDate.getDate()}}}if(this.defaults.maxDate){if(p.getFullYear()>this.defaults.maxDate.getFullYear()){v=0}else if(p.getFullYear()===this.defaults.maxDate.getFullYear()){if(p.getMonth()>this.defaults.maxDate.getMonth()){v=0}else if(p.getMonth()===this.defaults.maxDate.getMonth()){v=this.defaults.maxDate.getDate()}}}for(var $=0;$<p.getDay();$++){n.push('<li class="'+[a,l].join(" ")+'">&nbsp;</li>')}var C=getDaysInMonth(c,d);for(var S=1;S<=C;S++){var D=[a];if(S<u||S>v){D.push(r)}else if(f&&m&&S===g){D.push(i)}n.push('<li class="'+D.join(" ")+'">'+S+"</li>")}n.push("</ul>");n.push("</div>");return n.join("")}},{key:"getTimeWrapperHtml",value:function e(){var t=getClassNameFromSelector(this.cssSelectors.dpTimeWrapper);var s=getClassNameFromSelector(this.cssSelectors.dpSelectMenuLabel);var a=getClassNameFromSelector(this.cssSelectors.dpSelectMenu);var r=getClassNameFromSelector(this.cssSelectors.jsHour);var i=getClassNameFromSelector(this.cssSelectors.jsMinute);var l=getClassNameFromSelector(this.cssSelectors.jsMeridian);var n="";var o=this.defaults.value.getHours();var h=this.defaults.value.getMinutes();var c='<label class="'+s+'">\n    <select class="'+a+" "+r+'">\n        <option value="">hh</option>';for(var d=0;d<=12;d++){n="";if(o===d||o%12===d){n=" selected "}d=("0"+d).slice(-2);c+='<option value="'+d+'" '+n+">"+d+"</option>"}c+="</select></label>";var p=[0,15,30,45];var u='<label class="'+s+'">\n    <select class="'+a+" "+i+'">\n      <option value="">mm</option>';for(var v in p){n="";var f=parseInt(v)+1;if(h>=p[v]&&h<p[f]){n=" selected "}var m=("0"+p[v]).slice(-2);u+='<option value="'+m+'" '+n+">"+m+"</option>"}u+="</select></label>";var g="";var $="";if(o<12){g=" selected "}else{$=" selected "}var C='<label class="'+s+'">\n    <select class="'+a+" "+l+'">\n      <option value="">----</option>\n      <option value="am" '+g+'>am</option>\n      <option value="pm" '+$+">pm</option>\n    </select></label>";return'<div class="'+t+'">\n      <div>\n        '+c+"&nbsp;"+u+"&nbsp;"+C+'\n        <button type="button">Go</button>\n      </div>\n    </div>'}},{key:"getSelectedMonth",value:function e(){var t=this.$dp.find(this.cssSelectors.dpMonth+this.cssSelectors.active);var s=this.$dp.find(this.cssSelectors.dpMonth);return s.index(t)}},{key:"getSelectedDate",value:function e(){var t=this.$dp.find(this.cssSelectors.dpDate+this.cssSelectors.active);return parseInt(t.text())}},{key:"getOverlayHtml",value:function e(){var t=getClassNameFromSelector(this.cssSelectors.dpOverlay);return'<div class="'+t+'"></div>'}}]);return e}();function getFormattedDate(e){"use strict";return[e.getFullYear(),("0"+(e.getMonth()+1)).slice(-2),("0"+e.getDate()).slice(-2)].join("-")}function getFormattedDateTime(e){var t=arguments.length>1&&arguments[1]!==undefined?arguments[1]:false;var s=[("0"+e.getHours()).slice(-2),("0"+e.getMinutes()).slice(-2),("0"+e.getSeconds()).slice(-2)].join(":");if(t){var a=e.getHours();if(a>12){a=a%12}var r="am";if(e.getHours()>=12){r="pm"}s=[("0"+a).slice(-2),("0"+e.getMinutes()).slice(-2)].join(":");s=s+" "+r}return getFormattedDate(e)+" "+s}function getDaysInMonth(e,t){return new Date(e,t+1,0).getDate()}function getClassNameFromSelector(e){"use strict";return e.replace(".","")}$.fn.datepicker=function(){"use strict";$(this).each(function(){var e=$(this);var t=new DatePicker(e)})};