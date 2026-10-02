/* BOM from recipes.csv - lamps: id, label, parts (skin/base/day/bong/hop/to) */
const BULB_F='Bóng đèn OSRAM LED (3W, 3000K)', BULB_P='Bóng đèn LED RGB pro', BULB_S='Bóng đèn OSRAM LED Stick (7W, 2700K)';
const FB=['floria_desert_tan_base','floria_olive_green_base','floria_matte_red_base','floria_burnt_orange_base','floria_persian_blue_base','floria_milky_base'];
const SB=['strata_navy_blue_base','strata_matte_red_base'];
const SS=['strata_dark_blue_skin','strata_matte_red_skin'];
const LAMPS=[
 {id:'F',label:'FLORIA thường',parts:['floria_standard_skin',...FB,'Dây đèn + đuôi đèn',BULB_F,'Hộp carton loại 1','Tờ infor Floria']},
 {id:'FP',label:'FLORIA PRO',parts:['floria_standard_skin',...FB,'Dây đèn + đuôi đèn',BULB_P,'Hộp carton loại 1','Tờ infor Floria']},
 {id:'S',label:'STRATA',parts:[...SS,...SB,'Dây đèn + đuôi đèn',BULB_S,'Hộp carton loại 2','Tờ infor Strata']}
];
/* printed part -> source filament */
const FIL={'floria_standard_skin':'Nhựa PLA - trong suốt R3D',
 'floria_desert_tan_base':'Nhựa PLA Matte - Desert Tan Bambu','floria_olive_green_base':'Nhựa PLA Matte - Olive Green Tinmorry',
 'floria_matte_red_base':'Nhựa PLA Matte - Matte Red','floria_burnt_orange_base':'Nhựa PLA Basic - Burnt Orange R3D',
 'floria_persian_blue_base':'Nhựa PLA Basic - Persian Blue Bambu','floria_milky_base':'Nhựa PLA Matte - Milky',
 'strata_dark_blue_skin':'Nhựa PLA Matte - Dark Blue Bambu','strata_navy_blue_base':'Nhựa PLA Matte - Navy Blue Tinmorry',
 'strata_matte_red_skin':'Nhựa PLA Matte - Matte Red','strata_matte_red_base':'Nhựa PLA Matte - Matte Red'};
const CATC={'product':'#7EA6FF','PrintedComponent':'#4D79FF','Component':'#FFB224','Filament':'#00B8A9','Packaging':'#8E6BF1','Documentation':'#8A8F98'};
const SHORT=n=>n.replace('floria_','').replace('strata_','').replace('_base','').replace('_skin',' · vỏ').replace(/_/g,' ');