// Scenario Data
const scenarios = [
    {
        id: "scenario1",
        title: "Scenario 1: Pre-Appointment Communication",
        type: "decision",
        narratorText: "You are the clinic receptionist. You've just received this email from Sandra Wilson requesting an appointment. Today is Monday, and you need to check a few things before responding.",
        visualElements: {
            type: "email",
            content: {
                from: "Sandra.Wilson@email.com",
                subject: "Appointment Request",
                date: "Monday, March 9, 2025, 10:15 AM",
                body: `Hello,

I'd like to schedule an appointment with Dr. Martinez for a consultation about my recurring migraines. I'm deaf and use American Sign Language (ASL) as my primary language.

I've had negative experiences at medical facilities that weren't prepared to accommodate my communication needs. Could you please confirm whether you provide ASL interpretation services? I prefer morning appointments on Tuesdays or Thursdays if possible.

Thank you,
Sandra Wilson
Phone (text only): 555-123-4567`
            }
        },
        systemInfo: `CLINIC SYSTEM NOTES:
- Dr. Martinez has availability:
  * Tuesday (tomorrow) at 9:30 AM
  * Thursday at 11:00 AM
- Proprio ASL Interpretation Service status: SUBSCRIPTION RENEWAL REQUIRED
  * Renewal processing time: 24 hours
  * Last used: 2 weeks ago`,
        decisionQuestion: "How will you respond to Sandra's appointment request? Consider all factors in the situation.",
        options: [
            {
                id: "1a",
                text: "Schedule for Tuesday at 9:30 AM, immediately renew the Proprio subscription, and inform Sandra that interpretation will be arranged.",
                feedback: "This response addresses the appointment request and attempts to accommodate Sandra's needs by immediately renewing the Proprio subscription. However, there are two concerns: First, the 24-hour processing time means the system might not be ready for tomorrow's appointment. Second, the email doesn't adequately acknowledge Sandra's expressed concerns about past negative experiences or provide sufficient reassurance about accessibility. This could be improved by being more transparent about the situation or choosing the Thursday slot.",
                isCorrect: false,
                responseContent: {
                    type: "email",
                    content: {
                        to: "Sandra.Wilson@email.com",
                        subject: "RE: Appointment Request",
                        body: `Hello Sandra,

Thank you for your email. I've scheduled you with Dr. Martinez for tomorrow (Tuesday) at 9:30 AM. We do provide ASL interpretation through our Proprio service, which I am arranging for your appointment.

Please arrive 15 minutes early to complete registration forms. Let me know if you have any questions.

Regards,
[Your Name]
Clinic Reception`
                    }
                },
                score: 2
            },
            {
                id: "1b",
                text: "Schedule for Thursday at 11:00 AM, immediately renew the Proprio subscription, and explicitly confirm ASL interpretation will be available.",
                feedback: "Excellent decision! This response:<br>1. Chooses the Thursday appointment, ensuring the Proprio service will be active after the 24-hour renewal period<br>2. Explicitly confirms ASL interpretation will be available<br>3. Acknowledges Sandra's concern about previous negative experiences<br>4. Documents her communication needs in the system<br>5. Provides complete information and a text option for questions<br>This approach builds trust and follows best practices for communication accessibility.",
                isCorrect: true,
                responseContent: {
                    type: "email",
                    content: {
                        to: "Sandra.Wilson@email.com",
                        subject: "RE: Appointment Request",
                        body: `Hello Sandra,

Thank you for your email. I've scheduled you with Dr. Martinez for Thursday at 11:00 AM. We do provide ASL interpretation through our Proprio service, which will be fully prepared for your appointment.

I understand your concern about communication access based on previous experiences. I've noted in your file that you use ASL as your primary language, and our staff will be prepared to work with you through our interpreter service.

Please arrive 15 minutes early to complete registration forms. Feel free to text the clinic number with any questions.

Regards,
[Your Name]
Clinic Reception`
                    }
                },
                score: 5
            },
            {
                id: "1c",
                text: "Suggest Sandra bring her own interpreter since your system might not be renewed in time.",
                feedback: "This response creates several problems:<br>1. It inappropriately shifts responsibility to the patient to provide their own interpreter<br>2. It may violate accessibility requirements that place the obligation on healthcare providers to provide effective communication<br>3. It suggests written notes as an equivalent alternative to ASL, which may not be appropriate depending on the patient's preferences and English proficiency<br>4. It fails to acknowledge Sandra's expressed concerns about past negative experiences<br>Consider reviewing the clinic's SOP regarding communication accommodation.",
                isCorrect: false,
                responseContent: {
                    type: "email",
                    content: {
                        to: "Sandra.Wilson@email.com",
                        subject: "RE: Appointment Request",
                        body: `Hello Sandra,

Thank you for your email. I've scheduled you with Dr. Martinez for tomorrow (Tuesday) at 9:30 AM. 

While we do have an interpretation service, we're currently experiencing some technical issues with it. Would it be possible for you to bring your own interpreter? Alternatively, we can communicate through written notes.

Let me know if this works for you.

Regards,
[Your Name]
Clinic Reception`
                    }
                },
                score: 0
            },
            {
                id: "1d",
                text: "Schedule for Tuesday but warn her that interpretation might not be available.",
                feedback: "This response attempts to be transparent about potential technical issues, which is good. However:<br>1. It creates unnecessary anxiety for Sandra who has already expressed concerns about communication access<br>2. It doesn't make full use of the available Thursday appointment that would ensure the system is ready<br>3. The phrasing about 'technical limitations' is vague and might make Sandra concerned about the quality of interpretation<br>The clinic's SOP emphasizes providing certainty about communication access whenever possible.",
                isCorrect: false,
                responseContent: {
                    type: "email",
                    content: {
                        to: "Sandra.Wilson@email.com",
                        subject: "RE: Appointment Request",
                        body: `Hello Sandra,

Thank you for your email. I've scheduled you with Dr. Martinez for tomorrow (Tuesday) at 9:30 AM. 

We do provide ASL interpretation through our Proprio service, but I should inform you that the system is currently undergoing maintenance. We'll do our best to have it ready for your appointment, but I wanted to make you aware that there might be some technical limitations. We will have written communication options available as backup.

Please arrive 15 minutes early to complete registration forms.

Regards,
[Your Name]
Clinic Reception`
                    }
                },
                score: 1
            }
        ]
    },
    {
        id: "scenario2",
        title: "Scenario 2: Appointment Preparation",
        type: "multipleSelect",
        narratorText: "It's Wednesday afternoon, and you're preparing for tomorrow's appointments. Sandra Wilson's appointment with Dr. Martinez is scheduled for 11:00 AM tomorrow (Thursday). You want to ensure everything is ready for her visit.",
        systemInfo: `APPOINTMENT NOTES:
- Patient: Sandra Wilson (New patient)
- Provider: Dr. Martinez
- Time: Thursday, 11:00 AM
- Special Notes: Patient is deaf, uses ASL
- Proprio Status: ACTIVE (Renewed successfully)

CLINIC SCHEDULE NOTES:
- Dermatology department has Proprio scheduled until 10:45 AM
- Clinic typically gets busy around 11:30 AM with lunch rush`,
        selectionQuestion: "Select ALL the actions you should take to properly prepare for Sandra's appointment.",
        selectionInstruction: "Check all appropriate actions (multiple options may be correct)",
        options: [
            {
                id: "2a",
                text: "Update her electronic patient file with a note about ASL requirements and communication preferences",
                feedback: "Essential preparation. Documenting communication needs ensures all staff members who interact with Sandra are aware of her requirements. The SOP specifically states: 'Place a note in their file so that everyone on the team can see it.'",
                isCorrect: true,
                score: 1
            },
            {
                id: "2b",
                text: "Contact the dermatology department to confirm they will return the Proprio device by 10:45 AM",
                feedback: "Proactive coordination. Ensuring the Proprio device will be available on time prevents delays and demonstrates respect for Sandra's time. The SOP emphasizes having Proprio 'ready for their arrival.'",
                isCorrect: true,
                score: 1
            },
            {
                id: "2c",
                text: "Prepare a paper notepad and pen as a backup communication method",
                feedback: "Appropriate backup method. The SOP states: 'If the patient prefers to communicate via writing, provide paper and a pen or a tablet.' Having alternatives ready ensures smooth communication even if technology issues arise.",
                isCorrect: true,
                score: 1
            },
            {
                id: "2d",
                text: "Reserve the consultation room with optimal lighting and acoustics (Room 3)",
                feedback: "Environmental considerations are important. The room with optimal lighting makes it easier for Sandra to see lip movements, facial expressions, and the interpreter on the Proprio device. The SOP mentions ensuring 'a quiet environment to facilitate effective communication.'",
                isCorrect: true,
                score: 1
            },
            {
                id: "2e",
                text: "Schedule an additional 15 minutes for the appointment to account for interpretation time",
                feedback: "Time management accommodation. Communication through an interpreter often takes longer, and scheduling extra time prevents rushing, which could lead to misunderstandings. This aligns with providing effective communication.",
                isCorrect: true,
                score: 1
            },
            {
                id: "2f",
                text: "Print out clinic maps and directions in case Sandra needs them",
                feedback: "While helpful for some patients, Sandra hasn't requested directions, and her email indicates she's concerned about communication access, not finding the clinic. Focus on her stated needs rather than assuming additional requirements.",
                isCorrect: false,
                score: 0
            },
            {
                id: "2g",
                text: "Arrange for a staff member who knows basic ASL to be available",
                feedback: "Relying on staff with only basic ASL knowledge could lead to miscommunication. The SOP specifically mentions using Proprio for interpretation. Basic ASL would not be sufficient for a medical consultation about migraines.",
                isCorrect: false,
                score: 0
            },
            {
                id: "2h",
                text: "Send Sandra a text reminder about her appointment",
                feedback: "Appropriate communication method. Sandra provided her phone number for texts, indicating this is her preferred method for brief communications. A reminder helps ensure the appointment goes smoothly.",
                isCorrect: true,
                score: 1
            },
            {
                id: "2i",
                text: "Prepare a list of common medical terms related to migraines for the interpreter",
                feedback: "Professional interpreters through Proprio are trained in medical terminology. Preparing such a list assumes the interpreter lacks competence in their profession and is unnecessary.",
                isCorrect: false,
                score: 0
            }
        ]
    },
    {
        id: "scenario3",
        title: "Scenario 3: Patient Arrival and Initial Interaction",
        type: "decision",
        narratorText: "It's Thursday morning. Sandra has arrived 10 minutes early for her 11:00 AM appointment and approaches the reception desk. You notice she is looking at you expectantly. The Proprio device is still with the dermatology department but should be returned soon.",
        visualElements: {
            type: "scene",
            description: "Reception desk environment with Sandra standing at desk looking expectant but slightly anxious. Clock showing 10:50 AM. Busy clinic background with other patients."
        },
        decisionQuestion: "Sandra has arrived and is waiting at the reception desk. What's your best approach for this initial interaction?",
        options: [
            {
                id: "3a",
                text: "Make eye contact, smile, and greet her verbally while immediately reaching for a notepad and pen.",
                feedback: "Good approach. Making eye contact, smiling, and immediately using written communication shows respect and establishes an effective communication method. The note clearly identifies who you are and acknowledges that interpretation is coming. This follows the SOP guideline to 'greet the patient warmly and use clear, visible gestures.'",
                isCorrect: true,
                responseContent: {
                    type: "dialog",
                    content: "(You look up, make eye contact with Sandra, and smile)\nYou: \"Good morning!\" (speaking normally)\n(You immediately reach for a notepad and write:)\n\"Welcome! I'm [your name]. Are you Sandra? Your interpreter will be ready soon.\""
                },
                score: 4
            },
            {
                id: "3b",
                text: "Make eye contact, smile, and use pre-prepared visual check-in materials.",
                feedback: "Excellent approach! Using pre-prepared materials shows you've anticipated Sandra's needs and are ready to accommodate her. The tablet check-in system is efficient, and offering communication choice respects her autonomy. This is the most thorough implementation of the SOP, which states: 'If the patient prefers to communicate via writing, provide paper and a pen or a tablet.'",
                isCorrect: true,
                responseContent: {
                    type: "dialog",
                    content: "(You look up, make eye contact with Sandra, and smile warmly)\n(You immediately reach for a pre-prepared tablet with a welcome screen that reads:)\n\"Welcome to our clinic! Please tap your name to check in.\"\n(The screen shows a list of today's patients)\n(You also have a printed card ready that states:)\n\"Your interpreter will be ready at 11:00 AM. Would you prefer written communication while you wait?\""
                },
                score: 5
            },
            {
                id: "3c",
                text: "Smile and gesture for her to wait while you call someone who knows sign language.",
                feedback: "This approach has significant problems. While seeking additional help isn't inherently wrong, making Sandra wait without direct communication is disrespectful. The SOP doesn't suggest calling someone who knows sign language as a first response; it emphasizes direct communication and using Proprio. This approach makes Sandra feel excluded from her own healthcare experience.",
                isCorrect: false,
                responseContent: {
                    type: "dialog",
                    content: "(You look up, recognize Sandra must be the deaf patient, and smile uncertainly)\n(You hold up one finger in a \"wait a moment\" gesture)\n(You pick up the phone and call another department)\nYou: \"Hi, do we have anyone available who knows sign language? I have a deaf patient at reception.\"\n(While on the phone, you occasionally smile at Sandra but don't communicate directly with her)"
                },
                score: 1
            },
            {
                id: "3d",
                text: "Use exaggerated gestures and speak very slowly and loudly.",
                feedback: "This approach demonstrates a fundamental misunderstanding about deafness. Speaking loudly doesn't help someone who is deaf, and exaggerated gestures can be perceived as condescending. The SOP specifically guides staff to 'greet the patient warmly and use clear, visible gestures,' not to alter your speech in unnatural ways.",
                isCorrect: false,
                responseContent: {
                    type: "dialog",
                    content: "(You look up and recognize Sandra must be the deaf patient)\nYou: \"GOOD MORNING! ARE YOU HERE FOR AN APPOINTMENT?\" (speaking unnaturally slowly and loudly)\n(You point dramatically to the appointment book and then to your watch)\n(You nod your head excessively with raised eyebrows, waiting for her response)"
                },
                score: 0
            }
        ],
        followUp: {
            condition: ["3a", "3b"],
            type: "decision",
            narratorText: "Sandra nods and looks relieved. She takes the pen and writes: \"Yes, I'm Sandra Wilson. Here for Dr. Martinez at 11:00.\"",
            decisionQuestion: "What's your next step with Sandra?",
            options: [
                {
                    id: "3e",
                    text: "Have her complete standard intake forms while you check on the Proprio device.",
                    feedback: "While having Sandra complete intake forms is part of the process, moving immediately to paperwork without checking her communication preferences first misses an opportunity for patient-centered care. The SOP emphasizes asking patients about their communication preferences before proceeding with routine procedures.",
                    isCorrect: false,
                    score: 2
                },
                {
                    id: "3f",
                    text: "Offer her a seat and let her know you'll come get her when the doctor is ready.",
                    feedback: "This approach is too passive and misses the opportunity to proactively ensure communication access will be ready. While polite, it doesn't address the preparations needed for effective communication during her visit.",
                    isCorrect: false,
                    score: 1
                },
                {
                    id: "3g",
                    text: "Immediately escort her to a private area to complete registration with the Proprio device when it arrives.",
                    feedback: "Moving to a private area shows sensitivity to confidentiality, but doing this immediately without first confirming Sandra's communication preferences doesn't prioritize her input in the process. Remember that the SOP encourages asking patients about their preferences.",
                    isCorrect: false,
                    score: 3
                },
                {
                    id: "3h",
                    text: "Use the notepad to ask about her communication preferences for today's appointment.",
                    feedback: "Excellent! Asking about communication preferences respects Sandra's autonomy and acknowledges her expertise about her own needs. This approach follows the SOP guideline to 'Ask the patient if they have any preferences or feedback regarding communication methods.' This should be followed by escorting her to a private area for registration with the Proprio device.",
                    isCorrect: true,
                    score: 5
                }
            ]
        }
    },
    {
        id: "scenario4",
        title: "Scenario 4: Proprio Setup and Technical Issues",
        type: "decision",
        narratorText: "It's now 11:00 AM. The Proprio device has been returned from the dermatology department, and you're setting it up for Sandra's appointment with Dr. Martinez. Sandra is waiting in the consultation room.",
        visualElements: {
            type: "device",
            description: "Screen showing Proprio startup interface with connection settings menu, network status indicators, and video quality adjustment controls."
        },
        systemInfo: "When you attempt to connect to the ASL interpreter service, you receive an error message: 'Unable to connect to interpreter service. Error code: NET_BANDWIDTH_LIMITED'",
        decisionQuestion: "What's your first action to address this technical issue?",
        options: [
            {
                id: "4a",
                text: "Restart the Proprio device and try connecting again.",
                feedback: "Restarting the device is a reasonable first troubleshooting step, but not sufficient by itself in this case. Recognizing the continued network issue and finding an alternative solution shows adaptability. Remember that the SOP encourages finding solutions rather than abandoning the preferred communication method.",
                isCorrect: false,
                responseContent: {
                    type: "dialog",
                    content: "(You restart the device, but when you try to connect again, you receive a similar error message:)\n'Network bandwidth limited. Recommended action: Use alternative connection or reduce video quality.'"
                },
                score: 2,
                hasFollowUp: true
            },
            {
                id: "4b",
                text: "Check the network settings and switch to the clinic's backup cellular connection.",
                feedback: "Excellent troubleshooting! You identified that the issue was network-related and switched to the more reliable cellular backup. This demonstrates technical competence and prioritizes maintaining the patient's preferred communication method. The SOP indicates staff should be prepared to troubleshoot Proprio: 'If the connection drops, restart the device and reconnect.'",
                isCorrect: true,
                responseContent: {
                    type: "simulation",
                    steps: [
                        "Access the settings menu (tap gear icon)",
                        "Select \"Network Configuration\"",
                        "Change from \"Clinic Wi-Fi\" to \"Backup Cellular\"",
                        "Confirm the change",
                        "Test connection (tap \"Test Connection\" button)",
                        "Adjust video quality to \"Medium\" for stable connection",
                        "Reconnect to interpreter service"
                    ],
                    result: "Connection established! Video quality: Medium. ASL interpreter Jane is now available."
                },
                score: 5
            },
            {
                id: "4c",
                text: "Inform Dr. Martinez that written communication will need to be used instead.",
                feedback: "This approach too quickly abandons the patient's preferred communication method. The SOP states: 'If the patient prefers an alternative communication method, accommodate accordingly,' but this assumes you've made reasonable efforts to make the preferred method work first. Always attempt to resolve technical issues before defaulting to alternatives.",
                isCorrect: false,
                score: 1
            },
            {
                id: "4d",
                text: "Ask Sandra if she can use a video relay service on her personal device.",
                feedback: "This inappropriately shifts responsibility to the patient to solve the clinic's technical problems. It may make Sandra feel that her needs are a burden. The SOP places responsibility on the clinic to provide effective communication tools, not on the patient.",
                isCorrect: false,
                score: 0
            }
        ],
        followUp: {
            condition: ["4a"],
            type: "decision",
            decisionQuestion: "What will you do now?",
            options: [
                {
                    id: "4e",
                    text: "Try switching to the backup cellular connection",
                    feedback: "Good problem-solving! You recognized that the error message suggested an alternative connection and took appropriate action. This demonstrates adaptability and commitment to providing Sandra's preferred communication method.",
                    isCorrect: true,
                    score: 4
                },
                {
                    id: "4f",
                    text: "Reduce the video quality to minimum",
                    feedback: "While this might help with bandwidth issues, it might also degrade the quality to a point where communication becomes difficult. ASL relies on clear visual quality. The backup cellular connection would be a more reliable solution.",
                    isCorrect: false,
                    score: 2
                },
                {
                    id: "4g",
                    text: "Move to a different room to get better Wi-Fi signal",
                    feedback: "This might help, but it would require moving Sandra and causing delays. It's also uncertain if another location would have better signal. The backup cellular connection is a more immediate and reliable solution.",
                    isCorrect: false,
                    score: 1
                },
                {
                    id: "4h",
                    text: "Proceed with written communication",
                    feedback: "This too quickly abandons the preferred communication method without exhausting technical solutions. The error message suggested alternatives like changing connections, which should be tried before switching to written communication.",
                    isCorrect: false,
                    score: 0
                }
            ]
        },
        finalFollowUp: {
            type: "decision",
            decisionQuestion: "Now that you've established connection with the interpreter (or decided to use an alternative communication method), how do you explain the situation to Sandra?",
            options: [
                {
                    id: "4i",
                    text: "Bring the Proprio device to Sandra without explanation, letting the interpreter explain any delays.",
                    feedback: "This approach lacks transparency and could confuse or frustrate Sandra. Never rely on the interpreter to explain technical difficulties or clinic processes. Direct communication with the patient is always preferred.",
                    isCorrect: false,
                    score: 1
                },
                {
                    id: "4j",
                    text: "Write a note: \"Sorry for the delay. The interpreter is connected now. Dr. Martinez will be with you shortly.\"",
                    feedback: "This provides basic information but misses the opportunity to check if the video quality is acceptable to Sandra. Remember that the SOP encourages staff to 'Ask the patient if they have any preferences or feedback regarding communication methods.'",
                    isCorrect: false,
                    score: 2
                },
                {
                    id: "4k",
                    text: "Write a note explaining: \"We had a network issue but resolved it. The interpreter can see and hear you clearly now. Is the video quality good enough for you? Dr. Martinez will join us in a moment.\"",
                    feedback: "Excellent communication approach. Your explanation is transparent about what happened, confirms the issue is resolved, checks if the solution meets Sandra's needs, and sets expectations for next steps. This respects her autonomy and demonstrates patient-centered care.",
                    isCorrect: true,
                    score: 5
                },
                {
                    id: "4l",
                    text: "Bring Dr. Martinez with you and let them handle the communication now that the interpreter is connected.",
                    feedback: "While involving Dr. Martinez is appropriate, explaining the situation yourself first shows ownership of the process and prevents Sandra from feeling passed between staff members without clear communication.",
                    isCorrect: false,
                    score: 3
                }
            ]
        }
    },
    {
        id: "scenario5",
        title: "Scenario 5: Practitioner Introduction and History Taking",
        type: "decision",
        narratorText: "You are now Dr. Martinez. Sandra is in the consultation room, and the Proprio device is set up with the ASL interpreter connected. This is your first time meeting Sandra, who has come in for consultation about recurring migraines.",
        visualElements: {
            type: "scene",
            description: "Consultation room environment with Sandra seated, Proprio device positioned between you, and a medical history form visible but not yet completed."
        },
        decisionQuestion: "How will you begin your consultation with Sandra?",
        options: [
            {
                id: "5a",
                text: "Introduce yourself to the interpreter first and ask them to relay your greeting to Sandra.",
                feedback: "This approach incorrectly places the interpreter as an intermediary rather than a communication facilitator. Always speak directly to the patient, not to the interpreter. This approach may make Sandra feel excluded from her own healthcare conversation.",
                isCorrect: false,
                responseContent: {
                    type: "dialog",
                    content: "You (to interpreter): \"Hello, I'm Dr. Martinez. Could you please introduce me to Sandra and explain that I'll be conducting her consultation today?\""
                },
                score: 0
            },
            {
                id: "5b",
                text: "Sit directly across from Sandra, make eye contact, and introduce yourself while the interpreter translates.",
                feedback: "This approach has good elements—you're making eye contact and speaking directly to Sandra. However, the positioning might require Sandra to shift her attention back and forth between you and the interpreter, which can be tiring. Consider a triangular arrangement for better sightlines.",
                isCorrect: false,
                responseContent: {
                    type: "dialog",
                    content: "(You sit directly across from Sandra, making eye contact)\nYou: \"Hello Sandra, I'm Dr. Martinez. It's nice to meet you. I understand you're here to discuss your migraines. I'll be speaking directly to you, and the interpreter will translate our conversation.\""
                },
                score: 3
            },
            {
                id: "5c",
                text: "Position yourself, Sandra, and the Proprio device in a triangular arrangement, maintaining clear sightlines between all parties.",
                feedback: "Excellent approach! The triangular arrangement creates optimal sightlines for all parties and demonstrates understanding of deaf communication needs. Your introduction clearly establishes that you'll speak directly to Sandra while maintaining eye contact, and you appropriately invite her to provide feedback on the communication process. This follows best practices for interpreted medical consultations.",
                isCorrect: true,
                responseContent: {
                    type: "dialog",
                    content: "(You arrange seating in a triangle formation so Sandra can see both you and the interpreter without having to turn her head significantly)\nYou: \"Hello Sandra, I'm Dr. Martinez. Welcome to our clinic. I'll be speaking directly to you while looking at you, and our interpreter will translate. Please let me know if you need me to adjust my pace or if you have any questions at any point.\""
                },
                score: 5
            },
            {
                id: "5d",
                text: "Hand Sandra a printed questionnaire about her migraines to fill out before beginning the verbal consultation.",
                feedback: "Starting with a written questionnaire without explanation through the interpreter may suggest you're avoiding direct communication. While written materials can be helpful supplements, they shouldn't replace personal interaction, especially for an initial consultation.",
                isCorrect: false,
                score: 1
            }
        ],
        followUp: {
            type: "decision",
            narratorText: "Now you need to take Sandra's medical history, including her migraine symptoms, triggers, medical background, and current medications.",
            decisionQuestion: "What's the most effective approach for gathering Sandra's medical history?",
            options: [
                {
                    id: "5e",
                    text: "Ask all your questions first, then wait for Sandra to respond to each one as the interpreter catches up.",
                    feedback: "This approach is inefficient and may lead to confusion. It doesn't allow for natural conversation flow and might overwhelm both the interpreter and Sandra. It could lead to important details being missed as Sandra tries to remember all the questions.",
                    isCorrect: false,
                    score: 1
                },
                {
                    id: "5f",
                    text: "Ask one question at a time, maintaining a natural conversation pace, and watch for the interpreter to finish before moving to the next question.",
                    feedback: "This is the optimal approach for interpreted communication. It maintains a natural conversational flow while allowing sufficient time for accurate interpretation. This approach respects both the patient and the interpretation process.",
                    isCorrect: true,
                    score: 5
                },
                {
                    id: "5g",
                    text: "Provide Sandra with a detailed written medical history form and ask her to complete it while you wait.",
                    feedback: "While written forms can be useful tools, relying solely on them without verbal interaction may miss important details and nuances. This approach also assumes strong English literacy and doesn't take advantage of the interpreter who is now available.",
                    isCorrect: false,
                    score: 2
                },
                {
                    id: "5h",
                    text: "Ask the interpreter to explain that you need to gather medical history and to help ensure all details are accurately communicated.",
                    feedback: "This incorrectly shifts responsibility to the interpreter. The interpreter's role is to facilitate communication, not to explain medical procedures or ensure accuracy. This approach doesn't follow best practices for working with interpreters.",
                    isCorrect: false,
                    score: 0
                }
            ]
        },
        finalFollowUp: {
            type: "multipleSelect",
            selectionQuestion: "Select the best practices for taking a medical history through an interpreter.",
            selectionInstruction: "Choose all that apply",
            options: [
                {
                    id: "5i",
                    text: "Speak directly to Sandra using first-person language (\"How long have you had migraines?\" not \"Ask her how long...\")",
                    feedback: "Correct. Always speak directly to the patient, not to the interpreter. This respects the patient's autonomy and presence in the conversation.",
                    isCorrect: true,
                    score: 1
                },
                {
                    id: "5j",
                    text: "Use short, clear sentences rather than complex, compound questions",
                    feedback: "Correct. Short, clear sentences are easier to interpret accurately and reduce the chance of miscommunication.",
                    isCorrect: true,
                    score: 1
                },
                {
                    id: "5k",
                    text: "Allow extra time for the interpretation process without rushing",
                    feedback: "Correct. Interpretation takes time, and rushing can lead to errors or omissions. Patience demonstrates respect for the communication process.",
                    isCorrect: true,
                    score: 1
                },
                {
                    id: "5l",
                    text: "Check for understanding by asking Sandra to repeat information back to you",
                    feedback: "Correct. The teach-back method is an effective way to confirm understanding, especially for important medical information.",
                    isCorrect: true,
                    score: 1
                },
                {
                    id: "5m",
                    text: "Use medical terminology without simplification to ensure accuracy",
                    feedback: "Incorrect. While accuracy is important, using complex medical terminology without explanation can create barriers to understanding. Use clear language and explain medical terms when necessary.",
                    isCorrect: false,
                    score: 0
                },
                {
                    id: "5n",
                    text: "Avoid metaphors, idioms, or culturally-specific references",
                    feedback: "Correct. These expressions may not interpret well or might have different meanings across cultures and languages.",
                    isCorrect: true,
                    score: 1
                },
                {
                    id: "5o",
                    text: "Position yourself so Sandra can see your facial expressions",
                    feedback: "Correct. Facial expressions provide important communicative cues that supplement the interpreted content.",
                    isCorrect: true,
                    score: 1
                },
                {
                    id: "5p",
                    text: "Speak more loudly to ensure the interpreter can hear you clearly",
                    feedback: "Incorrect. Speaking loudly is unnecessary and may be distracting. Use a normal, clear speaking voice. The interpreter will ask for clarification if needed.",
                    isCorrect: false,
                    score: 0
                }
            ]
        }
    },
    {
        id: "scenario6",
        title: "Scenario 6: Treatment Explanation with Visual Aids",
        type: "multipleSelect",
        narratorText: "Based on Sandra's symptoms and medical history, you've diagnosed her with migraine with aura. You need to explain her condition, recommend a treatment plan involving preventive medication, rescue medication, and lifestyle modifications, and ensure she understands how to monitor and manage her symptoms.",
        visualElements: {
            type: "scene",
            description: "Treatment room with examination table and desk. Various communication aids available (diagrams, models, written materials). Tablet with medical apps and visual resources. Proprio device with interpreter."
        },
        selectionQuestion: "Which combination of communication methods would be most effective for explaining Sandra's migraine diagnosis and treatment plan?",
        selectionInstruction: "Select all that would be appropriate",
        options: [
            {
                id: "6a",
                text: "Verbal explanation through the interpreter with medical terminology",
                feedback: "While verbal explanation through the interpreter is necessary, using medical terminology without visual support may make understanding more difficult. Consider combining this with visual aids for better comprehension.",
                isCorrect: false,
                score: 0
            },
            {
                id: "6b",
                text: "Simple anatomical diagram showing brain blood vessels and migraine mechanisms",
                feedback: "Excellent choice. Visual representations of anatomical concepts enhance understanding, especially when discussing complex conditions like migraines. This supports the interpretation and gives Sandra a visual reference.",
                isCorrect: true,
                score: 1
            },
            {
                id: "6c",
                text: "Written prescription with medication names, dosages, and schedule",
                feedback: "Correct. Written prescriptions provide clear, reliable information that Sandra can reference later. This ensures accuracy with critical information like medication dosages and timing.",
                isCorrect: true,
                score: 1
            },
            {
                id: "6d",
                text: "Calendar-based visual for tracking migraines and identifying patterns",
                feedback: "Great choice. A visual tracking tool helps Sandra monitor her condition over time and identify patterns or triggers. This empowers her to participate actively in managing her health.",
                isCorrect: true,
                score: 1
            },
            {
                id: "6e",
                text: "Medication information sheets with simplified text and images",
                feedback: "Excellent. Information sheets with both text and images provide comprehensive information in an accessible format that Sandra can review at her own pace after the appointment.",
                isCorrect: true,
                score: 1
            },
            {
                id: "6f",
                text: "Demonstration of how to take rescue medication during an attack",
                feedback: "Very appropriate. Physical demonstrations transcend language barriers and help ensure proper medication administration, which is crucial for emergency situations like acute migraines.",
                isCorrect: true,
                score: 1
            },
            {
                id: "6g",
                text: "List of common migraine triggers with visual icons",
                feedback: "Perfect choice. Visual icons make information about triggers more memorable and easily recognizable, helping Sandra identify and avoid potential triggers in her daily life.",
                isCorrect: true,
                score: 1
            },
            {
                id: "6h",
                text: "Verbal explanation only, relying on the interpreter's medical knowledge",
                feedback: "This approach is insufficient. Relying solely on verbal explanation through an interpreter doesn't take advantage of visual learning opportunities that are particularly beneficial for complex medical concepts.",
                isCorrect: false,
                score: 0
            },
            {
                id: "6i",
                text: "Detailed medical journal article about migraine pathophysiology",
                feedback: "This is too technical and not patient-centered. Journal articles are written for medical professionals and typically contain complex terminology that isn't appropriate for patient education.",
                isCorrect: false,
                score: 0
            },
            {
                id: "6j",
                text: "Visual pain scale for recording migraine intensity",
                feedback: "Excellent tool. Visual pain scales transcend language barriers and provide a standardized way for Sandra to communicate pain intensity, which is crucial for monitoring treatment effectiveness.",
                isCorrect: true,
                score: 1
            }
        ],
        followUp: {
            type: "sequence",
            taskDescription: "Now, arrange these resources in the most logical sequence for your consultation.",
            items: [
                {
                    id: "6k",
                    text: "Anatomical diagram (diagnosis explanation)",
                    correctPosition: 1
                },
                {
                    id: "6l",
                    text: "Visual pain scale (assessment tool)",
                    correctPosition: 2
                },
                {
                    id: "6m",
                    text: "Written prescription (treatment plan)",
                    correctPosition: 3
                },
                {
                    id: "6n",
                    text: "Medication information sheets (treatment details)",
                    correctPosition: 4
                },
                {
                    id: "6o",
                    text: "Demonstration of rescue medication (practical skills)",
                    correctPosition: 5
                },
                {
                    id: "6p",
                    text: "Triggers list with icons (prevention)",
                    correctPosition: 6
                },
                {
                    id: "6q",
                    text: "Calendar-based tracking tool (ongoing management)",
                    correctPosition: 7
                }
            ],
            feedback: "Your sequencing follows a logical progression from diagnosis explanation, through treatment plan, to ongoing management. This structure helps Sandra build understanding systematically and connects each element of care to the overall picture."
        },
        finalFollowUp: {
            type: "decision",
            narratorText: "After explaining Sandra's diagnosis and treatment plan using visual aids, you need to ensure she has understood the information.",
            decisionQuestion: "What's the most effective way to confirm Sandra's understanding?",
            options: [
                {
                    id: "6r",
                    text: "Ask, \"Do you understand everything I've explained?\" and watch for her nod or affirmation.",
                    feedback: "Asking 'Do you understand?' typically yields 'yes' responses even when understanding is incomplete. Patients may nod to avoid appearing confused or to please the doctor. This approach doesn't verify actual comprehension.",
                    isCorrect: false,
                    score: 1
                },
                {
                    id: "6s",
                    text: "Provide a written summary and ask Sandra to sign it, confirming she understands the treatment plan.",
                    feedback: "While documentation is important, having Sandra sign a form doesn't confirm she truly understands the information. This approach focuses on liability protection rather than patient comprehension.",
                    isCorrect: false,
                    score: 2
                },
                {
                    id: "6t",
                    text: "Use the teach-back method, asking Sandra to explain in her own words how she'll take her medication and what warning signs require medical attention.",
                    feedback: "Excellent choice! The teach-back method is the gold standard for confirming patient understanding. By having Sandra explain the plan in her own words, you can identify any misunderstandings immediately and clarify as needed. This is particularly important for complex treatment plans like migraine management.",
                    isCorrect: true,
                    score: 5
                },
                {
                    id: "6u",
                    text: "Schedule a follow-up appointment in two weeks to address any questions that might arise after she's had time to review the materials.",
                    feedback: "While follow-up appointments are valuable, relying solely on a future appointment to clarify understanding means Sandra might use her medication incorrectly in the interim. Immediate confirmation of understanding is essential.",
                    isCorrect: false,
                    score: 2
                }
            ]
        }
    },
    {
        id: "scenario7",
        title: "Scenario 7: Handling an Emergency Situation",
        type: "sequence",
        narratorText: "During a follow-up visit one month later, Sandra is in the examination room when she suddenly shows signs of a severe allergic reaction to the new migraine preventive medication she started last week. Her face is becoming flushed and she's indicating difficulty breathing. The Proprio interpreter is connected.",
        visualElements: {
            type: "scene",
            description: "Examination room with medical emergency equipment. Sandra showing signs of distress. Emergency protocol poster visible on wall. Proprio device still connected with interpreter."
        },
        taskDescription: "What are your first actions when you recognize Sandra is having an allergic reaction? Arrange the steps in the correct sequence.",
        items: [
            {
                id: "7a",
                text: "Call for emergency assistance from clinic staff",
                correctPosition: 4
            },
            {
                id: "7b",
                text: "Administer epinephrine via auto-injector",
                correctPosition: 3
            },
            {
                id: "7c",
                text: "Quickly write \"allergic reaction\" and \"I'm helping you\" for Sandra to see",
                correctPosition: 5
            },
            {
                id: "7d",
                text: "Check airway, breathing, and circulation",
                correctPosition: 2
            },
            {
                id: "7e",
                text: "Assess severity by checking for hives, facial swelling, and respiratory distress",
                correctPosition: 1
            },
            {
                id: "7f",
                text: "Document time of reaction onset and intervention",
                correctPosition: 7
            },
            {
                id: "7g",
                text: "Move the Proprio device to maintain interpreter connection",
                correctPosition: 6
            }
        ],
        feedback: "Your sequence correctly prioritizes clinical assessment (checking severity and ABC), then life-saving intervention (epinephrine), followed by calling for help. Communication is appropriately integrated after immediate life threats are addressed. This balances medical urgency with the need for patient understanding.",
        followUp: {
            type: "multipleSelect",
            narratorText: "While waiting for additional help, you need to communicate with Sandra about what's happening and what you're doing.",
            selectionQuestion: "Which communication approaches are appropriate during this emergency situation?",
            selectionInstruction: "Select all that apply",
            options: [
                {
                    id: "7h",
                    text: "Use the interpreter to explain detailed medical information about the allergic reaction",
                    feedback: "Detailed explanations are inappropriate during the acute phase of an emergency. Focus on essential, life-saving information only at this stage.",
                    isCorrect: false,
                    score: 0
                },
                {
                    id: "7i",
                    text: "Use universal emergency hand signals along with simple written words",
                    feedback: "Excellent approach. Universal hand signals can quickly convey critical information across language barriers in emergency situations.",
                    isCorrect: true,
                    score: 1
                },
                {
                    id: "7j",
                    text: "Focus entirely on medical intervention and explain everything afterward",
                    feedback: "Completely withholding communication violates patient autonomy and may increase distress. Some level of communication should be maintained even during emergencies.",
                    isCorrect: false,
                    score: 0
                },
                {
                    id: "7k",
                    text: "Write brief, essential information: \"Allergic reaction,\" \"Medicine helping,\" \"More help coming\"",
                    feedback: "Perfect choice. Brief, essential written information provides just enough explanation to reduce anxiety without delaying treatment.",
                    isCorrect: true,
                    score: 1
                },
                {
                    id: "7l",
                    text: "Use simple gestures pointing to the medication and then to Sandra to indicate causation",
                    feedback: "Good approach. Simple gestures can effectively communicate basic information about what's happening without requiring complex language.",
                    isCorrect: true,
                    score: 1
                },
                {
                    id: "7m",
                    text: "Maintain eye contact and give reassuring nods while providing treatment",
                    feedback: "Excellent. Nonverbal reassurance helps reduce anxiety and builds trust during a frightening situation without distracting from medical care.",
                    isCorrect: true,
                    score: 1
                },
                {
                    id: "7n",
                    text: "Wait until the epinephrine takes effect before attempting any communication",
                    feedback: "Delaying all communication until after treatment unnecessarily increases anxiety. Brief communication can be integrated into care without compromising treatment speed.",
                    isCorrect: false,
                    score: 0
                },
                {
                    id: "7o",
                    text: "Ask a colleague to explain everything to the interpreter while you provide treatment",
                    feedback: "Directing communication to the interpreter rather than the patient excludes Sandra from her own emergency care. Communication should be directed to the patient even in emergencies.",
                    isCorrect: false,
                    score: 0
                }
            ]
        },
        finalFollowUp: {
            type: "decision",
            narratorText: "The emergency response team has arrived. Sandra has been stabilized and is breathing normally. She appears anxious and confused about what happened.",
            decisionQuestion: "How will you explain the emergency situation to Sandra now that she's stabilized?",
            options: [
                {
                    id: "7p",
                    text: "Have the emergency team explain the situation since they're now responsible for her care.",
                    feedback: "This approach inappropriately transfers responsibility and might make Sandra feel passed around between providers. As her primary provider who witnessed the event, you should maintain continuity of care by providing the explanation yourself.",
                    isCorrect: false,
                    score: 1
                },
                {
                    id: "7q",
                    text: "Write a detailed medical explanation of anaphylaxis and the treatment provided.",
                    feedback: "While written information can be helpful, a detailed technical explanation immediately after an emergency might be overwhelming. Using the interpreter allows for a more conversational approach with opportunity for questions.",
                    isCorrect: false,
                    score: 2
                },
                {
                    id: "7r",
                    text: "Using the interpreter, explain what happened in simple terms, what treatment was given, and what will happen next, then answer her questions.",
                    feedback: "Excellent approach. Speaking directly to Sandra through the interpreter with simple explanations restores normal communication now that the emergency has passed. Explaining what happened, what treatment was given, and next steps, then answering questions, respects her autonomy and reduces anxiety through information and control.",
                    isCorrect: true,
                    score: 5
                },
                {
                    id: "7s",
                    text: "Show Sandra a medical textbook page about allergic reactions so she understands the seriousness of what occurred.",
                    feedback: "Technical medical textbooks are not appropriate patient education materials, especially right after a frightening experience. This approach may increase anxiety rather than providing reassurance and clear information.",
                    isCorrect: false,
                    score: 0
                }
            ]
        }
    },
    {
        id: "scenario8",
        title: "Scenario 8: Post-Treatment and Follow-Up Planning",
        type: "multipleSelect",
        narratorText: "Sandra has recovered from her allergic reaction and has been prescribed a different migraine preventive medication. You're now preparing for her discharge and need to create a comprehensive follow-up plan.",
        visualElements: {
            type: "scene",
            description: "Consultation room setting with discharge paperwork and educational materials, prescription for new medication, follow-up scheduling calendar, and feedback form for clinic communication."
        },
        selectionQuestion: "Create a complete aftercare package for Sandra. Select all appropriate components.",
        selectionInstruction: "Check all items that should be included in Sandra's aftercare package",
        options: [
            {
                id: "8a",
                text: "New medication prescription with clear instructions",
                feedback: "Essential component. Clear medication instructions are critical for patient safety, especially after an adverse reaction to a previous medication.",
                isCorrect: true,
                score: 1
            },
            {
                id: "8b",
                text: "Allergy alert for electronic medical record and wallet card",
                feedback: "Critical safety measure. Documenting the allergy in both the EMR and providing a wallet card helps prevent future adverse reactions across all healthcare settings.",
                isCorrect: true,
                score: 1
            },
            {
                id: "8c",
                text: "Instructions for discontinuing previous medication with visual aids",
                feedback: "Important safety information presented in an accessible format. Clear instructions prevent medication errors during the transition.",
                isCorrect: true,
                score: 1
            },
            {
                id: "8d",
                text: "Signs and symptoms of allergic reaction to watch for with visual aids",
                feedback: "Excellent preventive education. Visual aids enhance understanding of warning signs that require immediate attention.",
                isCorrect: true,
                score: 1
            },
            {
                id: "8e",
                text: "Emergency action plan if symptoms recur with wallet card",
                feedback: "Critical safety component. A clear emergency plan with portable wallet card empowers Sandra to respond appropriately if symptoms recur.",
                isCorrect: true,
                score: 1
            },
            {
                id: "8f",
                text: "Migraine tracking tools (digital or paper)",
                feedback: "Excellent self-management tool. Tracking symptoms helps identify patterns, evaluate treatment effectiveness, and inform future care decisions.",
                isCorrect: true,
                score: 1
            },
            {
                id: "8g",
                text: "Follow-up appointment schedule in visual calendar format",
                feedback: "Important for continuity of care. A visual calendar format makes appointment information clear and accessible.",
                isCorrect: true,
                score: 1
            },
            {
                id: "8h",
                text: "Contact information for questions or concerns in multiple formats",
                feedback: "Essential for ongoing support. Multiple formats (text, visual, etc.) ensure Sandra can easily reach out with questions or concerns.",
                isCorrect: true,
                score: 1
            },
            {
                id: "8i",
                text: "Patient satisfaction survey about interpreter services",
                feedback: "Valuable feedback mechanism. This demonstrates commitment to improving services and respects Sandra's input in the quality improvement process.",
                isCorrect: true,
                score: 1
            },
            {
                id: "8j",
                text: "Detailed medical explanation of anaphylaxis pathophysiology",
                feedback: "Too technical for a patient education document. Focus on practical, action-oriented information rather than complex medical explanations.",
                isCorrect: false,
                score: 0
            }
        ],
        followUp: {
            type: "form",
            narratorText: "To improve Sandra's future experiences at the clinic, you need to document her communication preferences in her medical record.",
            formTitle: "Communication Access Plan",
            fields: [
                {
                    id: "8k",
                    type: "radio",
                    label: "Primary language",
                    options: ["ASL", "English", "Spanish", "Other"],
                    correctAnswer: "ASL"
                },
                {
                    id: "8l",
                    type: "radio",
                    label: "Preferred interpreter type",
                    options: ["ASL", "Signed English", "Other"],
                    correctAnswer: "ASL"
                },
                {
                    id: "8m",
                    type: "checkbox",
                    label: "Communication methods (select all that apply)",
                    options: ["ASL interpreter", "Written notes", "Lip reading", "Visual aids", "Family member assistance"],
                    correctAnswers: ["ASL interpreter", "Written notes", "Visual aids"]
                },
                {
                    id: "8n",
                    type: "radio",
                    label: "Interpretation service",
                    options: ["Proprio", "In-person", "Video Remote", "Other"],
                    correctAnswer: "Proprio"
                },
                {
                    id: "8o",
                    type: "text",
                    label: "Special considerations",
                    correctAnswer: "Prefers medical diagrams when explaining treatments. Allow extra time for questions through interpreter. Prefers text messaging for appointment reminders."
                },
                {
                    id: "8p",
                    type: "checkbox",
                    label: "Emergency communication preference",
                    options: ["Written cards", "Universal signs", "Interpreter", "Other"],
                    correctAnswers: ["Written cards", "Universal signs"]
                },
                {
                    id: "8q",
                    type: "radio",
                    label: "Consent to share communication plan with all providers",
                    options: ["Yes", "No"],
                    correctAnswer: "Yes"
                }
            ],
            feedback: "Excellent documentation of Sandra's communication preferences. You've captured not only her primary language and interpreter needs but also important details about her preferences for visual aids, extra time for questions, and text-based appointment reminders. This comprehensive profile will improve her care experience across all departments."
        },
        finalFollowUp: {
            type: "decision",
            decisionQuestion: "What approach will you take for Sandra's ongoing migraine management given her recent allergic reaction?",
            options: [
                {
                    id: "8r",
                    text: "Schedule standard follow-up appointments with longer time slots to accommodate interpretation needs.",
                    feedback: "While longer appointments are appropriate, this approach lacks the coordination with allergy specialists and enhanced communication protocols needed after an adverse reaction.",
                    isCorrect: false,
                    score: 2
                },
                {
                    id: "8s",
                    text: "Refer Sandra to a neurologist who specializes in migraines and let them take over her care completely.",
                    feedback: "Referring to a specialist without maintaining involvement fragments care and misses the opportunity to provide coordinated communication support.",
                    isCorrect: false,
                    score: 1
                },
                {
                    id: "8t",
                    text: "Create a comprehensive care plan including regular follow-ups, communication protocols for reporting side effects early, coordination with allergy specialist, and patient education resources.",
                    feedback: "This comprehensive approach exemplifies patient-centered care. By creating a coordinated plan that includes regular follow-ups, clear communication protocols, specialist coordination, and education resources, you address both Sandra's migraine management and her new allergy concerns. This approach also respects and integrates her communication needs throughout the care process.",
                    isCorrect: true,
                    score: 5
                },
                {
                    id: "8u",
                    text: "Schedule more frequent but shorter appointments to monitor for medication side effects.",
                    feedback: "More frequent appointments might increase monitoring but place an unnecessary burden on Sandra without addressing the need for specialist input and comprehensive education.",
                    isCorrect: false,
                    score: 2
                }
            ]
        }
    }
];

// Assessment categories for final results
const assessmentCategories = [
    {
        id: "communication",
        title: "Communication Skills",
        description: "Effectiveness in establishing and maintaining accessible communication"
    },
    {
        id: "technical",
        title: "Technical Competence",
        description: "Ability to set up and troubleshoot interpretation equipment"
    },
    {
        id: "medical",
        title: "Clinical Communication",
        description: "Effectiveness in delivering medical information accessibly"
    },
    {
        id: "emergency",
        title: "Emergency Management",
        description: "Appropriate balance of medical urgency with communication needs"
    },
    {
        id: "patient-centered",
        title: "Patient-Centered Care",
        description: "Maintaining patient autonomy, dignity, and preferences"
    }
];

// Performance levels for final assessment
const performanceLevels = [
    {
        level: "Expert",
        minScore: 90,
        description: "Demonstrates outstanding knowledge and skills in deaf patient communication"
    },
    {
        level: "Proficient",
        minScore: 75,
        description: "Shows strong competence in most aspects of deaf patient communication"
    },
    {
        level: "Developing",
        minScore: 60,
        description: "Demonstrates basic competence but needs improvement in some areas"
    },
    {
        level: "Needs Training",
        minScore: 0,
        description: "Requires significant additional training in deaf patient communication"
    }
];
