$(document).ready(function() {
    var Groupon = {
        specialCities: [ "berlin", "frankfurt", "hamburg", "koeln", "muenchen", "ruhrgebiet" ],
        showFlagInternationalOffer: 0x1,
        showFlagSpecialOffer: 0x2,
        
        init: function() {
            Groupon.clear();
        
            var city = window.localStorage.getItem("groupon.city");
            var showFlags = window.localStorage.getItem("groupon.showflags");
            
            if(city != null) {
                console.log(city);
                
                Groupon.getOffer(city, Groupon.showOffer);
                
                if(showFlags & Groupon.showFlagSpecialOffer) {
                    if(Groupon.specialCities.indexOf(city) != -1) {
                        Groupon.getOffer(city + "-special", Groupon.showSpecialOffer);
                        $('#specialOffer').css('display', 'block');
                    }
                }
            }
            
            if(showFlags & Groupon.showFlagInternationalOffer) {
                Groupon.getOffer("nationaler-deal", Groupon.showIntOffer);
                $('#intOffer').css('display', 'block');
            }
        },
        
        getOffer: function(city, showFunction) {        
            $.get("http://www.groupon.de/deals/" + city, function(grouponPage) {
                var offer = {};
                var page = $(grouponPage);
                var titleBlock = page.find("#contentDealTitle");
                offer.title = Groupon.getTitleFromBlock(titleBlock[0].children[2].innerText);
                offer.link = titleBlock[0].children[2].children[0].href;
                offer.price = jQuery.trim(Groupon.fIT(page, "span.price"));
                offer.sale = Groupon.fIT(page, "tr.row2 td.col1");
                offer.soldAmount = Groupon.fIT(page, "#jDealSoldAmount");
            
                showFunction(offer);
                
                //AUSVERKAUFT!
            });
        },

        showOffer: function(offer) {
            Groupon.showOfferDetails(offer, $('#cityOffer'));
        },
        
        showSpecialOffer: function(offer) {
            Groupon.showOfferDetails(offer, $('#specialOffer'));
        },
        
        showIntOffer: function(offer) {
            Groupon.showOfferDetails(offer, $('#intOffer'));
        },
        
        showOfferDetails: function(offer, block) {
            block[0].children[0].children[0].innerText = offer.price;
            block[0].children[0].children[1].innerText = 'Rabatt: ' + offer.sale;
            block[0].children[0].children[2].innerText = 'Bereits ' + offer.soldAmount + ' verkauft';
            block[0].children[1].children[0].innerText = offer.title;
            block[0].children[1].children[0].href = offer.link;
        },
        
        getTitleFromBlock: function(title) {
            var d1 = title.indexOf('–');
            var d2 = title.indexOf('-');
            var d = 0;
            if(d1 < d2) {
                d1 == -1 ? d = d2 : d = d1;
            } else {
                d2 == -1 ? d = d1 : d = d2;
            }
            
            var x = title.substring(d + 2, title.length);
            var y = x.replace(/\n/g,'');
            console.log(y);
            return y;
        },
        
        fIT: function(page, expression) {
            var block = page.find(expression);
            return block[0].innerText;
        },
        
        clear: function() {
            $('div.details > p').html("");
            $('p.title > a').html("");
            $('#intOffer').css('display', 'none');
            $('#specialOffer').css('display', 'none');
            
            $('#showIntOffer').attr('checked', false);
            $('#showSpecialOffer').attr('checked', false);
            var showFlags = window.localStorage.getItem("groupon.showflags");
            if(showFlags & Groupon.showFlagInternationalOffer) {
                $('#showIntOffer').attr('checked', true);
            }
            if(showFlags & Groupon.showFlagSpecialOffer) {
                $('#showSpecialOffer').attr('checked', true);
            }
            
            var city = window.localStorage.getItem("groupon.city");
            if(city != "" || city == null) {
                $('#citySelect').val(city);
            }
        }
    };
    
    Groupon.init();
    
    $('#showIntOffer').change(function() {
        var showFlags = window.localStorage.getItem("groupon.showflags");
        if($('#showIntOffer').attr('checked')) {
            showFlags |= Groupon.showFlagInternationalOffer;
        } else {
            showFlags &= ~Groupon.showFlagInternationalOffer;
        }
        window.localStorage.setItem("groupon.showflags", showFlags);
        Groupon.init();
    });
            
    $('#showSpecialOffer').change(function() {
        var showFlags = window.localStorage.getItem("groupon.showflags");
        if($('#showSpecialOffer').attr('checked')) {
            showFlags |= Groupon.showFlagSpecialOffer;
        } else {
            showFlags &= ~Groupon.showFlagSpecialOffer;
        }
        window.localStorage.setItem("groupon.showflags", showFlags);
        Groupon.init();
    });
    
    $('#citySelect').change(function() {
        var curCity = $('#citySelect').val();
        if(curCity != "" || curCity == null) {
            window.localStorage.setItem("groupon.city", curCity);
            Groupon.init();
        }
    });
});
