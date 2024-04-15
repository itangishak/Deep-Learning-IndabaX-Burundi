function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    var regexS = "[\\?&]" + name + "=([^&#]*)";
    var regex = new RegExp(regexS);
    var results = regex.exec(window.location.search);
    if (results == null) {
        return "";
    } else {
        return results.input;
    }
}

$(function() {

    $("#phone").keypress(function(e) {
        if (e.which != 8 && e.which != 0 && (e.which < 48 || e.which > 57)) {
            return false;
        }
    });	
	
    var email = localStorage.getItem("Email"); 		
    $("input[name=Email1]").val(email);
	
    var utmValue = undefined;

    function addFormElem(paramName) {
        var paramValue = getParameterByName(paramName);
        if (paramValue != "") {
            utmValue = paramValue;
        }
    }
    var utmParams = {
		"Source": "utm_src",
		"Medium": "utm_mdm",
		"Campaign": "utm_camp",
		"kwd": "utm_kwd"
    };
    addFormElem(utmParams['Source']);

    $(".exception_message").hide();
    $(".outcome_message").hide();
    $(".loading_form").hide();
    //var hostURL = $('#apiurls').data('contact');
    //var host = hostURL;
    var sessionId = AutopilotAnywhere.sessionId;
	 var gtmLeadSource = referrerDomain;

    $("#sponsorForm").validate({
        debug: true,
        rules: {
            FirstName1: {
                required: true
            },
            LastName1: {
                required: true
            },
            Email1: {
                required: true
            },
            Organisation: {
                required: true
            },
            Telephone1: {
                required: true
            },
            Country: {
                required: true
            }
        },
        submitHandler: function(form) {
            var firstName = $("input[name=FirstName1]").val();
            var lastName = $("input[name=LastName1]").val();
            var email = $("input[name=Email1]").val();
            var organisation = $("input[name=Organisation]").val();
            var telephone = $("input[name=Telephone1]").val();
            var country = $("select[name=Country]").val();
            var sessionId = AutopilotAnywhere.sessionId;

            var _this = this;
            $(this.submitButton).hide();
            $(".loading_form").show();

            $.ajax({
                url: "https://script.google.com/macros/s/AKfycbyh5kNZVr9kY1o4osrrrFx1KsjwXwO6KEtRJ1mvj6fq6Vfj9bwRlcon-k4e7Yht3QdUaQ/exec",
                type: "POST",
                data: {
                    "FirstName": firstName,
                    "LastName": lastName,
                    "Email": email,
                    "Organisation": organisation,
                    "Telephone": telephone,
                    "Country": country,
                    "ProductName": "Serverless360",
                   "Comment": "Integrate 2024 Sponsor",
                  	"SystemEnvironment": 0,
                    "SignupStage": 2,                   
					"GtmLeadSource": gtmLeadSource,
                    "AutoPilotSessionId": sessionId,
					"QueryString": "https://www.serverless360.com/events/integrate-2024",
					"ReferrerHistory": doc360ref.getJsonHistory()
                },
                cache: false,
                success: function(response) {
                    if (response.Success) {
//						dataLayer.push({
//								'event': 'conversion',
//								'eventCategory': 'form submitted',
//								'eventAction': 'Integrate 2024 Sponsors',
//								'eventLabel': 'Sponsors',
//								'eventValue': undefined,
//								'eventNonInteraction': undefined
//								});
						window.location.replace("/events/integrate-2024/thank-you-sponsor.html"); 
                      //$(".outcome_message").show();
                       $("#outcome_message_content1").html(response.Outcome);
                        $('#sponsorForm')[0].reset();
                        try {
                            __adroll.record_user({
                                "adroll_segments": "7a8b5b3f"
                            })
                        } catch (err) {}
                    } else {
                        $(".exception_message1").show();
                        $("#exception_message_content1").html(response.Exception);
                    }
                    $(_this.submitButton).show();
                    $(".loading_form").hide();
                }
            });
            return false;
            $(this.submitButton).show();
        }
    });

    $(".alert_close").click(function() {
        $(this).parent('div').hide();
    });

});

$(document).ready(function() {
    $("#sponsorForm").validate();
});