-- Quiz « Apprendre » en arabe (Moutahabina)
-- À lancer une seule fois dans Supabase > SQL Editor.
-- Ajoute la version arabe des quiz de la Wazifa, du Lazim, des chartes et des trois quiz « Le dahira »
-- (41 questions), avec les titres arabes de ces trois derniers thèmes.
-- Sécurité : seulement si le quiz en base est encore celui d'avant (sinon 0 ligne modifiée, rien n'est écrasé).

begin;

update public.sites
set quiz = $quiz${
  "intro": "Écoutez de courtes leçons, puis jouez : la Wazifa, le Lazim, les chartes, les ablutions, la prière et le dahira. Pas besoin de compte.",
  "themes": [
    {
      "id": "wazifa",
      "title": "La Wazifa",
      "description": "Ce que c’est, quand et comment la faire.",
      "icon": "ph-users",
      "questions": [
        {
          "question": "Combien de fois dit-on Astaghfirullah dans la Wazifa ?",
          "choices": [
            "30 fois",
            "100 fois",
            "12 fois"
          ],
          "answer": 0,
          "explanation": "Dans la Wazifa, on dit 30 fois Astaghfirullah.",
          "ar": {
            "question": "كم مرة يقال «أستغفر الله» في الوظيفة؟",
            "choices": [
              "ثلاثين مرة",
              "مائة مرة",
              "اثنتي عشرة مرة"
            ],
            "explanation": "في الوظيفة يقال «أستغفر الله» ثلاثين مرة."
          }
        },
        {
          "question": "Combien de fois récite-t-on la Salatul Fatihi ?",
          "choices": [
            "50 fois",
            "30 fois",
            "20 fois"
          ],
          "answer": 0,
          "explanation": "On récite 50 fois la Salatul Fatihi.",
          "ar": {
            "question": "كم مرة تُقرأ صلاة الفاتح؟",
            "choices": [
              "خمسين مرة",
              "ثلاثين مرة",
              "عشرين مرة"
            ],
            "explanation": "تُقرأ صلاة الفاتح خمسين مرة."
          }
        },
        {
          "question": "Combien de fois dit-on Lâ ilâha illallâh ?",
          "choices": [
            "100 fois",
            "50 fois",
            "12 fois"
          ],
          "answer": 0,
          "explanation": "On dit 100 fois Lâ ilâha illallâh.",
          "ar": {
            "question": "كم مرة يقال «لا إله إلا الله»؟",
            "choices": [
              "مائة مرة",
              "خمسين مرة",
              "اثنتي عشرة مرة"
            ],
            "explanation": "يقال «لا إله إلا الله» مائة مرة."
          }
        },
        {
          "question": "Combien de fois récite-t-on la Djawharatul Kamal ?",
          "choices": [
            "12 fois",
            "30 fois",
            "100 fois"
          ],
          "answer": 0,
          "explanation": "On récite 12 fois la Djawharatul Kamal.",
          "ar": {
            "question": "كم مرة تُقرأ جوهرة الكمال؟",
            "choices": [
              "اثنتي عشرة مرة",
              "ثلاثين مرة",
              "مائة مرة"
            ],
            "explanation": "تُقرأ جوهرة الكمال اثنتي عشرة مرة."
          }
        },
        {
          "question": "Sans eau pour les ablutions, que récite-t-on à la place de la Djawharatul Kamal ?",
          "choices": [
            "20 fois Salatul Fatihi",
            "Rien du tout",
            "100 fois Astaghfirullah"
          ],
          "answer": 0,
          "explanation": "On récite 20 fois la Salatul Fatihi à la place.",
          "ar": {
            "question": "عند فقد الماء، ماذا يُقرأ بدل جوهرة الكمال؟",
            "choices": [
              "صلاة الفاتح عشرين مرة",
              "لا شيء",
              "«أستغفر الله» مائة مرة"
            ],
            "explanation": "تُقرأ صلاة الفاتح عشرين مرة بدلها."
          }
        },
        {
          "question": "Comment fait-on la Wazifa, si possible ?",
          "choices": [
            "En groupe, à voix haute",
            "Seul, sans parler",
            "Debout en marchant"
          ],
          "answer": 0,
          "explanation": "Si possible, en groupe, assis en rangs, à voix haute et ensemble.",
          "ar": {
            "question": "كيف تؤدّى الوظيفة إن أمكن؟",
            "choices": [
              "جماعة وبصوت مرتفع",
              "فرديا دون كلام",
              "قياما مع المشي"
            ],
            "explanation": "تؤدّى جماعة إن أمكن، جلوسا في صفوف وبصوت واحد مرتفع."
          }
        }
      ],
      "lesson": {
        "cards": [
          {
            "title": "Qu’est-ce que la Wazifa ?",
            "text": "La Wazifa est une prière de la Tidjaniya. Elle fait partie des obligations du talibé. On la reçoit avec l’autorisation d’un moukadam.",
            "ar": {
              "title": "ما هي الوظيفة؟",
              "text": "الوظيفة ذكر من أذكار الطريقة التجانية، وهي من الأوراد اللازمة للمريد. تؤخذ بإذن من مقدّم مأذون."
            }
          },
          {
            "title": "Quand la faire ?",
            "text": "Au moins une fois par jour. Deux fois, matin et soir, c’est mieux. Si on la fait une seule fois : entre Takussan et le Takussan du lendemain.",
            "ar": {
              "title": "متى تؤدّى؟",
              "text": "مرة في اليوم على الأقل، ومرتين صباحا ومساء أفضل. ومن أدّاها مرة واحدة فوقتها من العصر إلى عصر اليوم التالي."
            }
          },
          {
            "title": "Ensemble, à voix haute",
            "text": "Si possible, on fait la Wazifa en groupe, assis en rangs, à voix haute et ensemble. Seul, on la récite doucement mais en s’entendant, assis et tourné vers la qibla.",
            "ar": {
              "title": "جماعة وبصوت مرتفع",
              "text": "تؤدّى الوظيفة جماعة إن أمكن، جلوسا في صفوف وبصوت واحد مرتفع. ومن كان وحده قرأها بصوت يُسمع به نفسه، جالسا مستقبل القبلة."
            }
          },
          {
            "title": "Les quatre parties",
            "text": "D’abord 30 fois Astaghfirullah. Ensuite 50 fois Salatul Fatihi. Puis 100 fois Lâ ilâha illallâh. Enfin 12 fois Djawharatul Kamal.",
            "ar": {
              "title": "أجزاؤها الأربعة",
              "text": "أولا: أستغفر الله ثلاثين مرة. ثم صلاة الفاتح خمسين مرة. ثم لا إله إلا الله مائة مرة. وأخيرا جوهرة الكمال اثنتي عشرة مرة."
            }
          },
          {
            "title": "La Djawharatul Kamal",
            "text": "On la récite seulement avec les ablutions faites à l’eau, dans un lieu propre, assis, avec des habits propres. Si ce n’est pas possible, par exemple sans eau ou en voiture, on récite 20 fois Salatul Fatihi à la place.",
            "ar": {
              "title": "جوهرة الكمال",
              "text": "لا تُقرأ إلا بطهارة مائية، في مكان طاهر، جلوسا، بثياب طاهرة. فإن تعذّر ذلك، كفقد الماء أو الركوب، قُرئت صلاة الفاتح عشرين مرة بدلها."
            }
          },
          {
            "title": "À retenir",
            "text": "Pendant la Wazifa, la seule prière sur le Prophète est la Salatul Fatihi. En groupe, il faut un lieu propre où tiennent au moins six personnes.",
            "ar": {
              "title": "للحفظ",
              "text": "لا يُصلّى على النبي ﷺ في الوظيفة إلا بصلاة الفاتح. وفي الجماعة يلزم مكان طاهر يسع ستة أشخاص على الأقل."
            }
          }
        ]
      },
      "category": "La Tariqa",
      "ar": {
        "title": "الوظيفة",
        "description": "ما هي، ومتى وكيف تؤدّى."
      }
    },
    {
      "id": "lazim",
      "title": "Le Lazim",
      "description": "Le wird du matin et du soir.",
      "icon": "ph-clock",
      "questions": [
        {
          "question": "Combien de fois par jour fait-on le Lazim ?",
          "choices": [
            "2 fois",
            "1 fois",
            "5 fois"
          ],
          "answer": 0,
          "explanation": "Deux fois par jour : le matin et le soir.",
          "ar": {
            "question": "كم مرة يؤدّى اللازم في اليوم؟",
            "choices": [
              "مرتين",
              "مرة واحدة",
              "خمس مرات"
            ],
            "explanation": "مرتين في اليوم: صباحا ومساء."
          }
        },
        {
          "question": "Combien de fois dit-on Astaghfirullah dans le Lazim ?",
          "choices": [
            "100 fois",
            "30 fois",
            "12 fois"
          ],
          "answer": 0,
          "explanation": "Dans le Lazim, chaque partie se dit 100 fois.",
          "ar": {
            "question": "كم مرة يقال «أستغفر الله» في اللازم؟",
            "choices": [
              "مائة مرة",
              "ثلاثين مرة",
              "اثنتي عشرة مرة"
            ],
            "explanation": "في اللازم يقال كل جزء مائة مرة."
          }
        },
        {
          "question": "Quelle est la meilleure prière sur le Prophète dans le Lazim ?",
          "choices": [
            "La Salatul Fatihi",
            "La Djawharatul Kamal",
            "La Fâtiha"
          ],
          "answer": 0,
          "explanation": "La meilleure prière sur le Prophète, c’est la Salatul Fatihi.",
          "ar": {
            "question": "ما أفضل صلاة على النبي ﷺ في اللازم؟",
            "choices": [
              "صلاة الفاتح",
              "جوهرة الكمال",
              "الفاتحة"
            ],
            "explanation": "أفضل الصلاة على النبي ﷺ صلاة الفاتح."
          }
        },
        {
          "question": "Quand commence le Lazim du soir ?",
          "choices": [
            "Après Takussan",
            "Après Timis",
            "Après Fajar"
          ],
          "answer": 0,
          "explanation": "Le Lazim du soir se fait après Takussan, jusqu’à Guéwé.",
          "ar": {
            "question": "متى يبدأ لازم المساء؟",
            "choices": [
              "بعد العصر",
              "بعد المغرب",
              "بعد الفجر"
            ],
            "explanation": "لازم المساء من بعد العصر إلى العشاء."
          }
        },
        {
          "question": "Peut-on parler pendant le Lazim ?",
          "choices": [
            "Non, sauf nécessité",
            "Oui, librement",
            "Seulement au téléphone"
          ],
          "answer": 0,
          "explanation": "On ne parle pas pendant le Lazim, sauf nécessité.",
          "ar": {
            "question": "هل يجوز الكلام أثناء اللازم؟",
            "choices": [
              "لا، إلا لضرورة",
              "نعم، بلا قيد",
              "في الهاتف فقط"
            ],
            "explanation": "لا يتكلّم أثناء اللازم إلا لضرورة."
          }
        },
        {
          "question": "On a oublié le Lazim. Que faire ?",
          "choices": [
            "Le rattraper",
            "Rien, c’est perdu",
            "Le faire deux fois le lendemain"
          ],
          "answer": 0,
          "explanation": "Un Lazim oublié doit être rattrapé.",
          "ar": {
            "question": "من فاته اللازم، ماذا يفعل؟",
            "choices": [
              "يقضيه",
              "لا شيء، فقد فات",
              "يؤدّيه مرتين في الغد"
            ],
            "explanation": "من فاته اللازم قضاه."
          }
        }
      ],
      "lesson": {
        "cards": [
          {
            "title": "Qu’est-ce que le Lazim ?",
            "text": "Le Lazim, c’est le wird obligatoire du talibé. On le fait deux fois par jour, le matin et le soir, seul et à voix basse. On le reçoit d’un moukadam autorisé.",
            "ar": {
              "title": "ما هو اللازم؟",
              "text": "اللازم هو الورد الواجب على المريد. يؤدّى مرتين في اليوم، صباحا ومساء، فرديا وسرّا. ويؤخذ عن مقدّم مأذون."
            }
          },
          {
            "title": "Les trois parties",
            "text": "D’abord 100 fois Astaghfirullah. Ensuite 100 fois la prière sur le Prophète ; la meilleure est la Salatul Fatihi. Enfin 100 fois Lâ ilâha illallâh, et on termine par Muhammadun Rasûlullâh, alayhi salâmullâh.",
            "ar": {
              "title": "أجزاؤه الثلاثة",
              "text": "أولا: أستغفر الله مائة مرة. ثم الصلاة على النبي ﷺ مائة مرة، وأفضلها صلاة الفاتح. ثم لا إله إلا الله مائة مرة، ويختم بقول: محمد رسول الله عليه سلام الله."
            }
          },
          {
            "title": "Le Lazim du matin",
            "text": "Après la prière de Fajar, jusqu’au milieu de la matinée. Avec une bonne excuse, on peut encore le faire jusqu’à Timis. On peut aussi l’avancer la nuit, après Guéwé, mais il doit être fini avant l’appel de Fajar.",
            "ar": {
              "title": "لازم الصباح",
              "text": "من بعد صلاة الصبح إلى الضحى. ولصاحب العذر أن يؤدّيه إلى المغرب. ويجوز تقديمه ليلا بعد العشاء، على أن يتمّ قبل أذان الفجر."
            }
          },
          {
            "title": "Le Lazim du soir",
            "text": "Après Takussan, jusqu’à Guéwé. Avec une bonne excuse, on peut encore le faire jusqu’à Fajar.",
            "ar": {
              "title": "لازم المساء",
              "text": "من بعد صلاة العصر إلى العشاء. ولصاحب العذر أن يؤدّيه إلى الفجر."
            }
          },
          {
            "title": "Pour qu’il soit valable",
            "text": "Avoir l’intention. Avoir fait ses ablutions. Corps, habits et lieu propres. Être bien couvert, comme pour la prière. Ne pas parler, sauf nécessité, et ne pas manger ni boire. S’il manque une de ces conditions, il faut le refaire.",
            "ar": {
              "title": "شروط صحّته",
              "text": "النية، والطهارة، وطهارة البدن والثوب والمكان، وستر العورة كما في الصلاة. وترك الكلام إلا لضرورة، وترك الأكل والشرب. فإن اختلّ شرط منها وجبت إعادته."
            }
          },
          {
            "title": "Pour bien le faire",
            "text": "S’asseoir. Se tourner vers la qibla. Réciter doucement, en bougeant les lèvres. Bien prononcer, sans aller trop vite. Un Lazim oublié doit être rattrapé.",
            "ar": {
              "title": "آدابه",
              "text": "الجلوس، واستقبال القبلة، والذكر بصوت خفيّ مع تحريك الشفتين، وحسن النطق دون إسراع. ومن فاته اللازم قضاه."
            }
          }
        ]
      },
      "category": "La Tariqa",
      "ar": {
        "title": "اللازم",
        "description": "الورد اللازم صباحا ومساء."
      }
    },
    {
      "id": "chartes-tariqa",
      "title": "Les 23 chartes de la Tariqa",
      "description": "Les règles du talibé tidjane, en 5 parties.",
      "icon": "ph-shield-check",
      "category": "La Tariqa",
      "questions": [
        {
          "question": "De qui reçoit-on le wird ?",
          "choices": [
            "D’un moukadam autorisé",
            "De n’importe quel ami",
            "D’un livre"
          ],
          "answer": 0,
          "explanation": "On reçoit le wird d’un moukadam autorisé, relié à la chaîne de transmission.",
          "ar": {
            "question": "عمّن يؤخذ الورد؟",
            "choices": [
              "عن مقدّم مأذون",
              "عن أيّ صديق",
              "من كتاب"
            ],
            "explanation": "يؤخذ الورد عن مقدّم مأذون، متّصل السند."
          }
        },
        {
          "question": "Peut-on prendre le wird d’une autre tariqa ?",
          "choices": [
            "Non",
            "Oui",
            "Seulement le vendredi"
          ],
          "answer": 0,
          "explanation": "Le talibé tidjane ne prend pas de wird d’une autre tariqa.",
          "ar": {
            "question": "هل يجوز أخذ ورد من طريقة أخرى؟",
            "choices": [
              "لا",
              "نعم",
              "يوم الجمعة فقط"
            ],
            "explanation": "المريد التجاني لا يأخذ وردا من طريقة أخرى."
          }
        },
        {
          "question": "Jusqu’à quand fait-on le wird ?",
          "choices": [
            "Jusqu’à la mort",
            "Pendant un an",
            "Pendant le Ramadan"
          ],
          "answer": 0,
          "explanation": "On fait le wird sans jamais l’abandonner, jusqu’à la mort.",
          "ar": {
            "question": "إلى متى يداوم على الورد؟",
            "choices": [
              "إلى الممات",
              "سنة واحدة",
              "في رمضان فقط"
            ],
            "explanation": "يداوم على الورد دون تركه إلى الممات."
          }
        },
        {
          "question": "Avec quoi récite-t-on la Djawharatul Kamal ?",
          "choices": [
            "Avec les ablutions",
            "Sans ablutions",
            "En marchant"
          ],
          "answer": 0,
          "explanation": "On ne récite la Djawharatul Kamal qu’avec les ablutions.",
          "ar": {
            "question": "بماذا تُقرأ جوهرة الكمال؟",
            "choices": [
              "بالطهارة",
              "بغير طهارة",
              "مع المشي"
            ],
            "explanation": "لا تُقرأ جوهرة الكمال إلا بطهارة."
          }
        },
        {
          "question": "Comment fait-on la Wazifa et la Hadratul Djouma ?",
          "choices": [
            "En groupe",
            "Seul, en cachette",
            "On ne les fait pas"
          ],
          "answer": 0,
          "explanation": "On les fait en groupe, si possible.",
          "ar": {
            "question": "كيف تؤدّى الوظيفة وهيللة الجمعة؟",
            "choices": [
              "جماعة",
              "فرديا في الخفاء",
              "لا تؤدّيان"
            ],
            "explanation": "تؤدّيان في جماعة إن أمكن."
          }
        },
        {
          "question": "Vers où se tourne-t-on pendant le wird ?",
          "choices": [
            "Vers la qibla",
            "Vers la porte",
            "Peu importe"
          ],
          "answer": 0,
          "explanation": "On s’assoit tourné vers la qibla, sauf exceptions.",
          "ar": {
            "question": "إلى أين يتوجّه أثناء الورد؟",
            "choices": [
              "إلى القبلة",
              "إلى الباب",
              "لا يهمّ"
            ],
            "explanation": "يجلس مستقبل القبلة، إلا لعذر."
          }
        },
        {
          "question": "Peut-on parler pendant le wird ?",
          "choices": [
            "Non, sauf nécessité",
            "Oui, librement",
            "Seulement pour rire"
          ],
          "answer": 0,
          "explanation": "On ne parle pas pendant le wird, sauf nécessité : répondre à ses parents, l’épouse à son mari, le talibé à son guide.",
          "ar": {
            "question": "هل يجوز الكلام أثناء الورد؟",
            "choices": [
              "لا، إلا لضرورة",
              "نعم، بلا قيد",
              "للضحك فقط"
            ],
            "explanation": "لا يتكلّم أثناء الورد إلا لضرورة: كإجابة الوالدين، والزوجة لزوجها، والمريد لشيخه."
          }
        },
        {
          "question": "Avec ses frères talibés, on doit…",
          "choices": [
            "Garder les liens et ne pas les fâcher",
            "Les éviter",
            "Les critiquer"
          ],
          "answer": 0,
          "explanation": "On ne coupe pas les liens avec ses frères talibés et on ne les fâche pas.",
          "ar": {
            "question": "مع الإخوان في الطريقة، يجب…",
            "choices": [
              "صلتهم وعدم إغضابهم",
              "اجتنابهم",
              "انتقادهم"
            ],
            "explanation": "لا يقطع إخوانه في الطريقة ولا يغضبهم."
          }
        }
      ],
      "lesson": {
        "cards": [
          {
            "title": "1. Le wird reçu d’un moukadam",
            "text": "Recevoir le wird d’un moukadam autorisé, relié à la chaîne de transmission.",
            "chapter": "Recevoir le wird",
            "ar": {
              "title": "1. أخذ الورد عن مقدّم",
              "text": "تلقّي الورد عن مقدّم مأذون، متّصل السند.",
              "chapter": "تلقّي الورد"
            }
          },
          {
            "title": "2. Un seul wird",
            "text": "Ne pas prendre de wird d’une autre tariqa.",
            "chapter": "Recevoir le wird",
            "ar": {
              "title": "2. ورد واحد",
              "text": "عدم أخذ ورد من طريقة أخرى.",
              "chapter": "تلقّي الورد"
            }
          },
          {
            "title": "11. L’autorisation",
            "text": "Faire le wird seulement après en avoir reçu l’autorisation.",
            "chapter": "Recevoir le wird",
            "ar": {
              "title": "11. الإذن",
              "text": "عدم ذكر الورد إلا بعد الإذن فيه.",
              "chapter": "تلقّي الورد"
            }
          },
          {
            "title": "3. Le ziar",
            "text": "Ne pas faire de ziar auprès d’un saint qui n’est pas tidjane, vivant ou mort. Respecter quand même les savants des autres voies.",
            "chapter": "Recevoir le wird",
            "ar": {
              "title": "3. الزيارة",
              "text": "عدم زيارة وليّ من غير أهل الطريقة، حيّا أو ميّتا، مع احترام علماء الطرق الأخرى.",
              "chapter": "تلقّي الورد"
            }
          },
          {
            "title": "16. Pas de faux titre",
            "text": "Ne pas se faire passer pour un saint, ni donner le wird sans autorisation.",
            "chapter": "Recevoir le wird",
            "ar": {
              "title": "16. لا ادّعاء",
              "text": "عدم ادّعاء الولاية، ولا إعطاء الورد بغير إذن.",
              "chapter": "تلقّي الورد"
            }
          },
          {
            "title": "5. Aimer Cheikh",
            "text": "Aimer et respecter Cheikh Ahmed Tidjani et ses khalifes, toute sa vie.",
            "chapter": "Aimer Cheikh",
            "ar": {
              "title": "5. محبّة الشيخ",
              "text": "محبّة الشيخ أحمد التجاني وخلفائه وتعظيمهم مدى الحياة.",
              "chapter": "محبّة الشيخ"
            }
          },
          {
            "title": "9. Une foi ferme",
            "text": "Avoir une foi ferme en Cheikh et en la tariqa.",
            "chapter": "Aimer Cheikh",
            "ar": {
              "title": "9. الاعتقاد الجازم",
              "text": "الاعتقاد الجازم في الشيخ وفي الطريقة.",
              "chapter": "محبّة الشيخ"
            }
          },
          {
            "title": "7. Aucune hostilité",
            "text": "N’avoir aucune hostilité envers Cheikh ou ses khalifes.",
            "chapter": "Aimer Cheikh",
            "ar": {
              "title": "7. ترك العداوة",
              "text": "عدم معاداة الشيخ أو خلفائه.",
              "chapter": "محبّة الشيخ"
            }
          },
          {
            "title": "10. Ne pas critiquer",
            "text": "Ne pas critiquer Cheikh, la tariqa, les khalifes ni les talibés.",
            "chapter": "Aimer Cheikh",
            "ar": {
              "title": "10. ترك الانتقاد",
              "text": "عدم انتقاد الشيخ ولا الطريقة ولا الخلفاء ولا الإخوان.",
              "chapter": "محبّة الشيخ"
            }
          },
          {
            "title": "6. Rester humble",
            "text": "Ne pas se croire à l’abri de ses fautes.",
            "chapter": "Aimer Cheikh",
            "ar": {
              "title": "6. الخشية",
              "text": "عدم الأمن من مكر الله.",
              "chapter": "محبّة الشيخ"
            }
          },
          {
            "title": "8. Jusqu’à la mort",
            "text": "Faire le wird sans jamais l’abandonner, jusqu’à la mort.",
            "chapter": "Le wird chaque jour",
            "ar": {
              "title": "8. حتى الممات",
              "text": "المداومة على الورد دون تركه إلى الممات.",
              "chapter": "الورد كل يوم"
            }
          },
          {
            "title": "15. Ne pas négliger",
            "text": "Ne pas négliger le wird ni le faire en retard sans excuse.",
            "chapter": "Le wird chaque jour",
            "ar": {
              "title": "15. عدم التهاون",
              "text": "عدم التهاون في الورد، ولا تأخيره عن وقته بغير عذر.",
              "chapter": "الورد كل يوم"
            }
          },
          {
            "title": "4. Les cinq prières",
            "text": "Faire les cinq prières en groupe, si possible.",
            "chapter": "Le wird chaque jour",
            "ar": {
              "title": "4. الصلوات الخمس",
              "text": "أداء الصلوات الخمس في جماعة إن أمكن.",
              "chapter": "الورد كل يوم"
            }
          },
          {
            "title": "12. En groupe",
            "text": "Faire la Wazifa et la Hadratul Djouma du vendredi en groupe.",
            "chapter": "Le wird chaque jour",
            "ar": {
              "title": "12. الاجتماع",
              "text": "أداء الوظيفة وهيللة الجمعة في جماعة.",
              "chapter": "الورد كل يوم"
            }
          },
          {
            "title": "14. Garder les liens",
            "text": "Ne pas couper les liens avec sa famille ni avec ses frères talibés.",
            "chapter": "La fraternité",
            "ar": {
              "title": "14. صلة الرحم",
              "text": "عدم قطع الرحم، ولا قطيعة الإخوان في الطريقة.",
              "chapter": "الأخوّة"
            }
          },
          {
            "title": "17. Le respect",
            "text": "Respecter toute personne liée à Cheikh ou à la tariqa.",
            "chapter": "La fraternité",
            "ar": {
              "title": "17. الاحترام",
              "text": "احترام كل من ينتسب إلى الشيخ أو إلى الطريقة.",
              "chapter": "الأخوّة"
            }
          },
          {
            "title": "18. La fraternité",
            "text": "Ne pas fâcher son frère talibé.",
            "chapter": "La fraternité",
            "ar": {
              "title": "18. الأخوّة",
              "text": "عدم إغضاب الأخ في الطريقة.",
              "chapter": "الأخوّة"
            }
          },
          {
            "title": "13. La Djawharatul Kamal",
            "text": "Ne réciter la Djawharatul Kamal qu’avec les ablutions.",
            "chapter": "Pendant le wird",
            "ar": {
              "title": "13. جوهرة الكمال",
              "text": "عدم قراءة جوهرة الكمال إلا بطهارة.",
              "chapter": "أثناء الورد"
            }
          },
          {
            "title": "19. La pureté",
            "text": "Être en état de pureté, avec des habits propres, dans un lieu propre.",
            "chapter": "Pendant le wird",
            "ar": {
              "title": "19. الطهارة",
              "text": "الطهارة، وطهارة الثوب والمكان.",
              "chapter": "أثناء الورد"
            }
          },
          {
            "title": "20. La qibla",
            "text": "S’asseoir tourné vers la qibla pendant le wird, sauf exceptions.",
            "chapter": "Pendant le wird",
            "ar": {
              "title": "20. القبلة",
              "text": "الجلوس مستقبل القبلة أثناء الورد، إلا لعذر.",
              "chapter": "أثناء الورد"
            }
          },
          {
            "title": "21. Le silence",
            "text": "Ne pas parler pendant le wird, sauf nécessité : répondre à ses parents, l’épouse à son mari, le talibé à son guide.",
            "chapter": "Pendant le wird",
            "ar": {
              "title": "21. الصمت",
              "text": "ترك الكلام أثناء الورد إلا لضرورة: كإجابة الوالدين، والزوجة لزوجها، والمريد لشيخه.",
              "chapter": "أثناء الورد"
            }
          },
          {
            "title": "22. La concentration",
            "text": "Se concentrer sur les paroles du wird et bien les prononcer.",
            "chapter": "Pendant le wird",
            "ar": {
              "title": "22. التدبّر",
              "text": "التدبّر في ألفاظ الورد وحسن النطق بها.",
              "chapter": "أثناء الورد"
            }
          },
          {
            "title": "23. La présence",
            "text": "Ressentir la présence du Prophète, paix et salut sur lui, de Cheikh ou de son guide.",
            "chapter": "Pendant le wird",
            "ar": {
              "title": "23. الاستحضار",
              "text": "استحضار صورة النبي ﷺ أو الشيخ أو المرشد.",
              "chapter": "أثناء الورد"
            }
          }
        ]
      },
      "ar": {
        "title": "شروط الطريقة الثلاثة والعشرون",
        "description": "آداب المريد التجاني في خمسة أجزاء."
      }
    },
    {
      "id": "farata-ndiapp",
      "title": "Farata ndiapp",
      "description": "Ce qui est obligatoire dans les ablutions.",
      "icon": "ph-drop",
      "source": "Mukhtasar d'Al-Akhdari (rite malikite)",
      "questions": [
        {
          "question": "Combien y a-t-il de farata dans les ablutions ?",
          "choices": [
            "7",
            "5",
            "10"
          ],
          "answer": 0,
          "explanation": "Il y a sept farata dans les ablutions.",
          "ar": {
            "question": "كم عدد فرائض الوضوء؟",
            "choices": [
              "سبع",
              "خمس",
              "عشر"
            ],
            "explanation": "فرائض الوضوء سبع."
          }
        },
        {
          "question": "Quelle est la première farata des ablutions ?",
          "choices": [
            "L'intention (niyya)",
            "Se rincer la bouche",
            "Se laver les oreilles"
          ],
          "answer": 0,
          "explanation": "La première farata, c'est l'intention, au début des ablutions.",
          "ar": {
            "question": "ما أول فرائض الوضوء؟",
            "choices": [
              "النية",
              "المضمضة",
              "مسح الأذنين"
            ],
            "explanation": "أول فرائض الوضوء النية، تكون عند الشروع فيه."
          }
        },
        {
          "question": "Jusqu'où faut-il laver les bras ?",
          "choices": [
            "Jusqu'aux coudes",
            "Jusqu'aux poignets",
            "Jusqu'aux épaules"
          ],
          "answer": 0,
          "explanation": "On lave les bras jusqu'aux coudes.",
          "ar": {
            "question": "إلى أين تُغسل اليدان؟",
            "choices": [
              "إلى المرفقين",
              "إلى الكوعين",
              "إلى المنكبين"
            ],
            "explanation": "من فرائض الوضوء غسل اليدين إلى المرفقين."
          },
          "choiceImages": [
            "/assets/quiz/ablution-bras-coudes.svg",
            "/assets/quiz/ablution-mains-poignets.svg",
            "/assets/quiz/ablution-bras-epaules.svg"
          ]
        },
        {
          "question": "Pour la tête, que faut-il faire ?",
          "choices": [
            "Passer les mains mouillées dessus (massah)",
            "La laver entièrement",
            "Rien"
          ],
          "answer": 0,
          "explanation": "On passe les mains mouillées sur la tête : c'est le massah.",
          "ar": {
            "question": "ماذا يُفعل بالرأس في الوضوء؟",
            "choices": [
              "يُمسح باليدين المبلولتين",
              "يُغسل كله",
              "لا شيء"
            ],
            "explanation": "من فرائض الوضوء مسح الرأس."
          },
          "image": "/assets/quiz/ablution-tete.svg",
          "imageAlt": "Les mains mouillées passent sur la tête"
        },
        {
          "question": "Jusqu'où faut-il laver les pieds ?",
          "choices": [
            "Jusqu'aux chevilles",
            "Jusqu'aux genoux",
            "Seulement les orteils"
          ],
          "answer": 0,
          "explanation": "On lave les pieds jusqu'aux chevilles.",
          "ar": {
            "question": "إلى أين تُغسل الرجلان؟",
            "choices": [
              "إلى الكعبين",
              "إلى الركبتين",
              "الأصابع فقط"
            ],
            "explanation": "من فرائض الوضوء غسل الرجلين إلى الكعبين."
          },
          "choiceImages": [
            "/assets/quiz/ablution-pieds-chevilles.svg",
            "/assets/quiz/ablution-pieds-genoux.svg",
            "/assets/quiz/ablution-orteils.svg"
          ]
        },
        {
          "question": "Que veut dire « dalk » ?",
          "choices": [
            "Frotter les membres en les lavant",
            "Laver trois fois",
            "Commencer par la droite"
          ],
          "answer": 0,
          "explanation": "Le dalk, c'est frotter chaque membre en le lavant. C'est une obligation.",
          "ar": {
            "question": "ما هو الدلك؟",
            "choices": [
              "إمرار اليد على العضو مع الغسل",
              "الغسل ثلاث مرات",
              "البداية باليمنى"
            ],
            "explanation": "الدلك من فرائض الوضوء."
          }
        },
        {
          "question": "Que veut dire « fawr » ?",
          "choices": [
            "Enchaîner les ablutions sans s'arrêter longtemps",
            "Faire très vite",
            "Utiliser beaucoup d'eau"
          ],
          "answer": 0,
          "explanation": "Le fawr, c'est enchaîner les ablutions sans s'arrêter longtemps.",
          "ar": {
            "question": "ما هو الفور؟",
            "choices": [
              "الموالاة بين الأعضاء دون تفريق طويل",
              "الإسراع الشديد",
              "كثرة الماء"
            ],
            "explanation": "الفور من فرائض الوضوء."
          }
        },
        {
          "question": "On a oublié une farata et on s'en souvient tout de suite. Que faire ?",
          "choices": [
            "La faire, puis ce qui vient après",
            "Ne rien faire",
            "Attendre la prochaine prière"
          ],
          "answer": 0,
          "explanation": "Si on s'en souvient vite, on fait la farata oubliée, puis ce qui vient après.",
          "ar": {
            "question": "من نسي فرضا من أعضائه وتذكره بالقرب، ماذا يفعل؟",
            "choices": [
              "يفعله ويفعل ما بعده",
              "لا شيء عليه",
              "ينتظر الصلاة القادمة"
            ],
            "explanation": "من نسي فرضا فإن تذكره بالقرب فعله وما بعده."
          }
        }
      ],
      "ar": {
        "title": "فرائض الوضوء",
        "description": "فرائض الوضوء السبع."
      },
      "category": "Ablutions et prière",
      "lesson": {
        "cards": [
          {
            "title": "Les sept farata",
            "text": "Il y a sept farata dans les ablutions. Ce sont les gestes obligatoires : sans eux, les ablutions ne sont pas valables.",
            "ar": {
              "title": "فرائض الوضوء السبع",
              "text": "فرائض الوضوء سبع، وهي أفعال واجبة لا يصحّ الوضوء بدونها."
            }
          },
          {
            "title": "1. L’intention",
            "text": "On commence par l’intention (niyya) : dans son cœur, on veut faire ses ablutions.",
            "ar": {
              "title": "1. النية",
              "text": "يبدأ بالنية: أن يقصد بقلبه أداء الوضوء."
            }
          },
          {
            "title": "2. Le visage",
            "text": "On lave tout le visage, des cheveux jusqu’au menton, et d’une oreille à l’autre.",
            "image": "/assets/quiz/ablution-visage.svg",
            "imageAlt": "Laver le visage",
            "ar": {
              "title": "2. غسل الوجه",
              "text": "يغسل الوجه كلّه، من منابت شعر الرأس إلى الذقن، ومن الأذن إلى الأذن."
            }
          },
          {
            "title": "3. Les bras jusqu’aux coudes",
            "text": "On lave les mains et les bras jusqu’aux coudes, coudes compris. On lave aussi entre les doigts.",
            "image": "/assets/quiz/ablution-bras-coudes.svg",
            "imageAlt": "Laver les bras jusqu’aux coudes",
            "ar": {
              "title": "3. غسل اليدين إلى المرفقين",
              "text": "يغسل اليدين إلى المرفقين، والمرفقان داخلان، مع تخليل أصابع اليدين."
            }
          },
          {
            "title": "4. La tête : le massah",
            "text": "On passe les mains mouillées sur la tête.",
            "image": "/assets/quiz/ablution-tete.svg",
            "imageAlt": "Passer les mains mouillées sur la tête",
            "ar": {
              "title": "4. مسح الرأس",
              "text": "يمسح الرأس باليدين المبلولتين."
            }
          },
          {
            "title": "5. Les pieds jusqu’aux chevilles",
            "text": "On lave les pieds jusqu’aux chevilles, chevilles comprises.",
            "image": "/assets/quiz/ablution-pieds-chevilles.svg",
            "imageAlt": "Laver les pieds jusqu’aux chevilles",
            "ar": {
              "title": "5. غسل الرجلين إلى الكعبين",
              "text": "يغسل الرجلين إلى الكعبين، والكعبان داخلان."
            }
          },
          {
            "title": "6 et 7. Le dalk et le fawr",
            "text": "On frotte chaque membre en le lavant : c’est le dalk. On enchaîne les ablutions sans longue pause : c’est le fawr.",
            "ar": {
              "title": "6 و7. الدلك والفور",
              "text": "الدلك: إمرار اليد على العضو مع الغسل. والفور: الموالاة بين الأعضاء دون تفريق طويل."
            }
          },
          {
            "title": "Si on oublie une farata",
            "text": "Si on s’en rend compte vite, on la fait, puis on refait ce qui vient après. Si on s’en rend compte tard, on la fait seule, et on refait les prières faites depuis.",
            "ar": {
              "title": "من نسي فرضا",
              "text": "إن تذكّره بالقرب فعله وما بعده. وإن طال فعله وحده، وأعاد ما صلّى بعده."
            }
          }
        ]
      }
    },
    {
      "id": "sunna-ndiapp",
      "title": "Sunna ndiapp",
      "description": "Farata ou sunna ? Ce qui est recommandé dans les ablutions.",
      "icon": "ph-drop-half",
      "source": "Mukhtasar d'Al-Akhdari (rite malikite)",
      "keepOrder": true,
      "questions": [
        {
          "question": "Se rincer la bouche (madmada)",
          "choices": [
            "Farata (obligatoire)",
            "Sunna (recommandée)"
          ],
          "answer": 1,
          "explanation": "Se rincer la bouche est une sunna des ablutions.",
          "ar": {
            "question": "المضمضة",
            "choices": [
              "فرض",
              "سنة"
            ],
            "explanation": "المضمضة من سنن الوضوء."
          },
          "image": "/assets/quiz/ablution-bouche.svg",
          "imageAlt": "Se rincer la bouche"
        },
        {
          "question": "Aspirer l'eau par le nez (istinchâq)",
          "choices": [
            "Farata (obligatoire)",
            "Sunna (recommandée)"
          ],
          "answer": 1,
          "explanation": "Aspirer l'eau par le nez est une sunna.",
          "ar": {
            "question": "الاستنشاق",
            "choices": [
              "فرض",
              "سنة"
            ],
            "explanation": "الاستنشاق من سنن الوضوء."
          },
          "image": "/assets/quiz/ablution-nez.svg",
          "imageAlt": "Aspirer l’eau par le nez"
        },
        {
          "question": "Laver le visage",
          "choices": [
            "Farata (obligatoire)",
            "Sunna (recommandée)"
          ],
          "answer": 0,
          "explanation": "Laver le visage est une farata.",
          "ar": {
            "question": "غسل الوجه",
            "choices": [
              "فرض",
              "سنة"
            ],
            "explanation": "غسل الوجه من فرائض الوضوء."
          },
          "image": "/assets/quiz/ablution-visage.svg",
          "imageAlt": "Laver le visage"
        },
        {
          "question": "Essuyer les oreilles",
          "choices": [
            "Farata (obligatoire)",
            "Sunna (recommandée)"
          ],
          "answer": 1,
          "explanation": "Essuyer les oreilles est une sunna. On reprend de l'eau pour elles.",
          "ar": {
            "question": "مسح الأذنين",
            "choices": [
              "فرض",
              "سنة"
            ],
            "explanation": "مسح الأذنين وتجديد الماء لهما من سنن الوضوء."
          },
          "image": "/assets/quiz/ablution-oreilles.svg",
          "imageAlt": "Essuyer les oreilles"
        },
        {
          "question": "Se laver les mains jusqu'aux poignets au début",
          "choices": [
            "Farata (obligatoire)",
            "Sunna (recommandée)"
          ],
          "answer": 1,
          "explanation": "Se laver les mains jusqu'aux poignets en commençant est une sunna.",
          "ar": {
            "question": "غسل اليدين إلى الكوعين عند الشروع",
            "choices": [
              "فرض",
              "سنة"
            ],
            "explanation": "غسل اليدين إلى الكوعين عند الشروع من سنن الوضوء."
          },
          "image": "/assets/quiz/ablution-mains-poignets.svg",
          "imageAlt": "Laver les mains jusqu’aux poignets"
        },
        {
          "question": "Frotter les membres (dalk)",
          "choices": [
            "Farata (obligatoire)",
            "Sunna (recommandée)"
          ],
          "answer": 0,
          "explanation": "Le dalk est une farata.",
          "ar": {
            "question": "الدلك",
            "choices": [
              "فرض",
              "سنة"
            ],
            "explanation": "الدلك من فرائض الوضوء."
          }
        },
        {
          "question": "Respecter l'ordre des farata",
          "choices": [
            "Farata (obligatoire)",
            "Sunna (recommandée)"
          ],
          "answer": 1,
          "explanation": "Faire les farata dans l'ordre est une sunna.",
          "ar": {
            "question": "الترتيب بين الفرائض",
            "choices": [
              "فرض",
              "سنة"
            ],
            "explanation": "الترتيب بين الفرائض من سنن الوضوء."
          }
        },
        {
          "question": "On a oublié une sunna des ablutions. Que faire ?",
          "choices": [
            "La faire, sans refaire la prière",
            "Refaire toutes ses prières",
            "Recommencer les ablutions et la prière"
          ],
          "answer": 0,
          "explanation": "Si on oublie une sunna, on la fait. Pas besoin de refaire la prière.",
          "ar": {
            "question": "من ترك سنة من سنن الوضوء، ماذا يفعل؟",
            "choices": [
              "يفعلها ولا يعيد الصلاة",
              "يعيد كل صلواته",
              "يعيد الوضوء والصلاة"
            ],
            "explanation": "وإن ترك سنة فعلها ولا يعيد الصلاة."
          }
        }
      ],
      "ar": {
        "title": "سنن الوضوء",
        "description": "فرض أم سنة؟ سنن الوضوء."
      },
      "category": "Ablutions et prière",
      "lesson": {
        "cards": [
          {
            "title": "Les sunna des ablutions",
            "text": "Les sunna sont fortement recommandées. On ne les laisse pas exprès. Il y en a huit.",
            "ar": {
              "title": "سنن الوضوء",
              "text": "السنن مؤكّدة، فلا تُترك عمدا. وهي ثمان."
            }
          },
          {
            "title": "Les mains jusqu’aux poignets",
            "text": "Au début, on se lave les mains jusqu’aux poignets.",
            "image": "/assets/quiz/ablution-mains-poignets.svg",
            "imageAlt": "Laver les mains jusqu’aux poignets",
            "ar": {
              "title": "غسل اليدين إلى الكوعين",
              "text": "يغسل اليدين إلى الكوعين عند الشروع."
            }
          },
          {
            "title": "La bouche : la madmada",
            "text": "On met de l’eau dans la bouche, on la remue, puis on la recrache.",
            "image": "/assets/quiz/ablution-bouche.svg",
            "imageAlt": "Se rincer la bouche",
            "ar": {
              "title": "المضمضة",
              "text": "يُدخل الماء في فمه ويحرّكه ثم يمجّه."
            }
          },
          {
            "title": "Le nez",
            "text": "On aspire un peu d’eau par le nez (istinchâq), puis on la rejette (istinthâr).",
            "image": "/assets/quiz/ablution-nez.svg",
            "imageAlt": "Aspirer l’eau par le nez",
            "ar": {
              "title": "الأنف",
              "text": "يجذب الماء بأنفه وهو الاستنشاق، ثم ينثره وهو الاستنثار."
            }
          },
          {
            "title": "La tête, aller et retour",
            "text": "Après le massah de la tête, on repasse les mains en sens inverse.",
            "image": "/assets/quiz/ablution-tete.svg",
            "imageAlt": "Passer les mains sur la tête",
            "ar": {
              "title": "ردّ مسح الرأس",
              "text": "بعد مسح الرأس يردّ يديه من مؤخّر الرأس إلى مقدّمه."
            }
          },
          {
            "title": "Les oreilles",
            "text": "On essuie les oreilles, en reprenant de l’eau pour elles.",
            "image": "/assets/quiz/ablution-oreilles.svg",
            "imageAlt": "Essuyer les oreilles",
            "ar": {
              "title": "الأذنان",
              "text": "يمسح الأذنين ويجدّد لهما الماء."
            }
          },
          {
            "title": "L’ordre",
            "text": "On fait les farata dans l’ordre : le visage, les bras, la tête, puis les pieds.",
            "ar": {
              "title": "الترتيب",
              "text": "الترتيب بين الفرائض: الوجه، ثم اليدان، ثم الرأس، ثم الرجلان."
            }
          },
          {
            "title": "Si on oublie une sunna",
            "text": "On fait seulement la sunna oubliée. Pas besoin de refaire la prière.",
            "ar": {
              "title": "من نسي سنّة",
              "text": "يفعلها وحدها، ولا يعيد الصلاة."
            }
          },
          {
            "title": "Les gestes qui apportent du mérite",
            "text": "Dire « Bismillah », utiliser le cure-dents (siwak), laver le visage et les bras une deuxième et une troisième fois, commencer par la droite, et ne pas gaspiller l’eau.",
            "ar": {
              "title": "الفضائل",
              "text": "التسمية، والسواك، والغسلة الثانية والثالثة للوجه واليدين، والبدء بالميامن، وقلّة الماء."
            }
          }
        ]
      }
    },
    {
      "id": "farata-diouli",
      "title": "Farata diouli",
      "description": "Ce qui est obligatoire dans la prière.",
      "icon": "ph-hands-praying",
      "source": "Mukhtasar d'Al-Akhdari (rite malikite)",
      "questions": [
        {
          "question": "Combien y a-t-il de farata dans la prière ?",
          "choices": [
            "14",
            "7",
            "5"
          ],
          "answer": 0,
          "explanation": "Al-Akhdari compte quatorze farata dans la prière.",
          "ar": {
            "question": "كم عدد فرائض الصلاة عند الأخضري؟",
            "choices": [
              "أربع عشرة",
              "سبع",
              "خمس"
            ],
            "explanation": "ذكر الأخضري أربع عشرة فريضة."
          }
        },
        {
          "question": "Par quoi entre-t-on en prière ?",
          "choices": [
            "La takbîr d'entrée « Allahou Akbar »",
            "Le salam",
            "Une sourate"
          ],
          "answer": 0,
          "explanation": "On entre en prière par la takbîr d'entrée (takbîratoul ihrâm), dite debout.",
          "ar": {
            "question": "بمَ يدخل المصلي في الصلاة؟",
            "choices": [
              "بتكبيرة الإحرام",
              "بالسلام",
              "بالسورة"
            ],
            "explanation": "من فرائض الصلاة تكبيرة الإحرام والقيام لها."
          },
          "image": "/assets/quiz/priere-takbir.svg",
          "imageAlt": "Takbîr d’entrée, mains levées"
        },
        {
          "question": "Quand faut-il faire l'intention de la prière ?",
          "choices": [
            "Au moment de la takbîr d'entrée",
            "Après la Fâtiha",
            "À la fin de la prière"
          ],
          "answer": 0,
          "explanation": "On fait l'intention en disant la takbîr d'entrée.",
          "ar": {
            "question": "متى تكون نية الصلاة؟",
            "choices": [
              "مقارنة لتكبيرة الإحرام",
              "بعد الفاتحة",
              "في آخر الصلاة"
            ],
            "explanation": "وشروط النية مقارنتها لتكبيرة الإحرام."
          }
        },
        {
          "question": "Réciter la Fâtiha",
          "choices": [
            "Farata (obligatoire)",
            "Sunna (recommandée)"
          ],
          "answer": 0,
          "explanation": "Réciter la Fâtiha, debout, est une farata.",
          "ar": {
            "question": "قراءة الفاتحة",
            "choices": [
              "فرض",
              "سنة"
            ],
            "explanation": "الفاتحة والقيام لها من فرائض الصلاة."
          },
          "image": "/assets/quiz/priere-debout.svg",
          "imageAlt": "Debout pour réciter la Fâtiha"
        },
        {
          "question": "Se redresser après l'inclinaison (roukou')",
          "choices": [
            "Farata (obligatoire)",
            "Sunna (recommandée)"
          ],
          "answer": 0,
          "explanation": "S'incliner (roukou') puis se redresser : ce sont des farata.",
          "ar": {
            "question": "الرفع من الركوع",
            "choices": [
              "فرض",
              "سنة"
            ],
            "explanation": "الركوع والرفع منه من فرائض الصلاة."
          },
          "image": "/assets/quiz/priere-roukou.svg",
          "imageAlt": "Inclinaison (roukou’)"
        },
        {
          "question": "Que veut dire « touma'nîna » ?",
          "choices": [
            "Marquer un temps de calme dans chaque position",
            "Prier vite",
            "Prier à voix haute"
          ],
          "answer": 0,
          "explanation": "La touma'nîna, c'est rester calme un instant dans chaque position. C'est une farata.",
          "ar": {
            "question": "ما هي الطمأنينة؟",
            "choices": [
              "السكون في كل ركن قليلا",
              "الإسراع في الصلاة",
              "الجهر بالقراءة"
            ],
            "explanation": "الطمأنينة من فرائض الصلاة."
          }
        },
        {
          "question": "Poser le front au sol pendant la prosternation",
          "choices": [
            "Farata (obligatoire)",
            "Sunna (recommandée)"
          ],
          "answer": 0,
          "explanation": "Poser le front au sol est une farata.",
          "ar": {
            "question": "السجود على الجبهة",
            "choices": [
              "فرض",
              "سنة"
            ],
            "explanation": "السجود على الجبهة والرفع منه من فرائض الصلاة."
          },
          "image": "/assets/quiz/priere-soujoud.svg",
          "imageAlt": "Prosternation, le front au sol"
        },
        {
          "question": "Comment sort-on de la prière ?",
          "choices": [
            "Par le salam, en étant assis",
            "Par la takbîr",
            "En se levant"
          ],
          "answer": 0,
          "explanation": "Le salam est une farata, et la position assise pour le dire aussi.",
          "ar": {
            "question": "بمَ يخرج المصلي من الصلاة؟",
            "choices": [
              "بالسلام مع الجلوس له",
              "بالتكبير",
              "بالقيام"
            ],
            "explanation": "السلام وجلوسه الذي يقارنه من فرائض الصلاة."
          },
          "image": "/assets/quiz/priere-salam.svg",
          "imageAlt": "Salam, en position assise"
        }
      ],
      "ar": {
        "title": "فرائض الصلاة",
        "description": "فرائض الصلاة."
      },
      "category": "Ablutions et prière",
      "lesson": {
        "cards": [
          {
            "title": "Les quatorze farata",
            "text": "Al-Akhdari compte quatorze farata dans la prière. Ce sont les gestes et les paroles obligatoires.",
            "ar": {
              "title": "فرائض الصلاة الأربع عشرة",
              "text": "ذكر الأخضري أربع عشرة فريضة في الصلاة، وهي أفعال وأقوال واجبة."
            }
          },
          {
            "title": "L’intention et le premier « Allahou Akbar »",
            "text": "On entre en prière par la takbîr d’entrée, debout. On fait l’intention de la prière à ce moment-là.",
            "image": "/assets/quiz/priere-takbir.svg",
            "imageAlt": "Dire Allahou Akbar, les mains levées",
            "ar": {
              "title": "النية وتكبيرة الإحرام",
              "text": "يدخل في الصلاة بتكبيرة الإحرام قائما، وينوي الصلاة عندها."
            }
          },
          {
            "title": "La Fâtiha, debout",
            "text": "On récite la Fâtiha en restant debout.",
            "image": "/assets/quiz/priere-debout.svg",
            "imageAlt": "Debout pendant la récitation",
            "ar": {
              "title": "الفاتحة والقيام لها",
              "text": "يقرأ الفاتحة وهو قائم."
            }
          },
          {
            "title": "L’inclinaison : le roukou’",
            "text": "On s’incline (roukou’), puis on se redresse bien droit.",
            "image": "/assets/quiz/priere-roukou.svg",
            "imageAlt": "S’incliner, les mains sur les genoux",
            "ar": {
              "title": "الركوع",
              "text": "يركع، ثم يرفع منه معتدلا."
            }
          },
          {
            "title": "La prosternation : le soujoud",
            "text": "On se prosterne, le front posé au sol, puis on se relève.",
            "image": "/assets/quiz/priere-soujoud.svg",
            "imageAlt": "Front posé au sol",
            "ar": {
              "title": "السجود",
              "text": "يسجد على جبهته، ثم يرفع منه."
            }
          },
          {
            "title": "Le calme dans chaque position",
            "text": "On reste un instant calme dans chaque position : c’est la touma’nîna. Et on fait tout dans l’ordre.",
            "ar": {
              "title": "الطمأنينة",
              "text": "يطمئنّ في كل ركن قليلا، ويرتّب الفرائض."
            }
          },
          {
            "title": "Le salam, assis",
            "text": "On sort de la prière par le salam, en étant assis.",
            "image": "/assets/quiz/priere-salam.svg",
            "imageAlt": "Tourner la tête pour le salam",
            "ar": {
              "title": "السلام والجلوس له",
              "text": "يخرج من الصلاة بالسلام وهو جالس."
            }
          }
        ]
      }
    },
    {
      "id": "sunna-diouli",
      "title": "Sunna diouli",
      "description": "Farata ou sunna ? Ce qui est recommandé dans la prière.",
      "icon": "ph-mosque",
      "source": "Mukhtasar d'Al-Akhdari (rite malikite)",
      "keepOrder": true,
      "questions": [
        {
          "question": "Réciter une sourate après la Fâtiha",
          "choices": [
            "Farata (obligatoire)",
            "Sunna (recommandée)"
          ],
          "answer": 1,
          "explanation": "La sourate après la Fâtiha est une sunna.",
          "ar": {
            "question": "السورة التي بعد الفاتحة",
            "choices": [
              "فرض",
              "سنة"
            ],
            "explanation": "السورة التي بعد الفاتحة من سنن الصلاة."
          },
          "image": "/assets/quiz/priere-debout.svg",
          "imageAlt": "Debout pour réciter la sourate"
        },
        {
          "question": "Les « Allahou Akbar » après celui d'entrée",
          "choices": [
            "Farata (obligatoire)",
            "Sunna (recommandée)"
          ],
          "answer": 1,
          "explanation": "Toutes les takbîr sont des sunnas, sauf la première.",
          "ar": {
            "question": "التكبير بعد تكبيرة الإحرام",
            "choices": [
              "فرض",
              "سنة"
            ],
            "explanation": "كل تكبيرة سنة إلا الأولى."
          }
        },
        {
          "question": "Dire « Sami'allâhou liman hamidah »",
          "choices": [
            "Farata (obligatoire)",
            "Sunna (recommandée)"
          ],
          "answer": 1,
          "explanation": "C'est une sunna.",
          "ar": {
            "question": "قول: سمع الله لمن حمده",
            "choices": [
              "فرض",
              "سنة"
            ],
            "explanation": "سمع الله لمن حمده من سنن الصلاة."
          }
        },
        {
          "question": "Le tachahhoud (attahiyyâtou)",
          "choices": [
            "Farata (obligatoire)",
            "Sunna (recommandée)"
          ],
          "answer": 1,
          "explanation": "Les deux tachahhoud, et la position assise pour les dire, sont des sunnas.",
          "ar": {
            "question": "التشهد",
            "choices": [
              "فرض",
              "سنة"
            ],
            "explanation": "التشهدان والجلوس لهما من سنن الصلاة."
          },
          "image": "/assets/quiz/priere-assis.svg",
          "imageAlt": "Assis pour le tachahhoud"
        },
        {
          "question": "La takbîr d'entrée « Allahou Akbar »",
          "choices": [
            "Farata (obligatoire)",
            "Sunna (recommandée)"
          ],
          "answer": 0,
          "explanation": "La takbîr d'entrée est une farata.",
          "ar": {
            "question": "تكبيرة الإحرام",
            "choices": [
              "فرض",
              "سنة"
            ],
            "explanation": "تكبيرة الإحرام من فرائض الصلاة."
          },
          "image": "/assets/quiz/priere-takbir.svg",
          "imageAlt": "Takbîr d’entrée, mains levées"
        },
        {
          "question": "La prière sur le Prophète (PSL)",
          "choices": [
            "Farata (obligatoire)",
            "Sunna (recommandée)"
          ],
          "answer": 1,
          "explanation": "La prière sur le Prophète (PSL) est une sunna.",
          "ar": {
            "question": "الصلاة على رسول الله ﷺ",
            "choices": [
              "فرض",
              "سنة"
            ],
            "explanation": "الصلاة على رسول الله ﷺ من سنن الصلاة."
          }
        },
        {
          "question": "L'iqâma avant la prière",
          "choices": [
            "Farata (obligatoire)",
            "Sunna (recommandée)"
          ],
          "answer": 1,
          "explanation": "L'iqâma est une sunna.",
          "ar": {
            "question": "الإقامة",
            "choices": [
              "فرض",
              "سنة"
            ],
            "explanation": "الإقامة من سنن الصلاة."
          }
        },
        {
          "question": "Réciter à voix haute dans les prières à voix haute",
          "choices": [
            "Farata (obligatoire)",
            "Sunna (recommandée)"
          ],
          "answer": 1,
          "explanation": "Réciter à voix haute là où c'est prévu est une sunna.",
          "ar": {
            "question": "الجهر فيما يجهر فيه",
            "choices": [
              "فرض",
              "سنة"
            ],
            "explanation": "الجهر فيما يجهر فيه من سنن الصلاة."
          }
        }
      ],
      "ar": {
        "title": "سنن الصلاة",
        "description": "فرض أم سنة؟ سنن الصلاة."
      },
      "category": "Ablutions et prière",
      "lesson": {
        "cards": [
          {
            "title": "Les sunna de la prière",
            "text": "Les sunna sont fortement recommandées dans la prière. On ne les laisse pas exprès.",
            "ar": {
              "title": "سنن الصلاة",
              "text": "السنن مؤكّدة في الصلاة، فلا تُترك عمدا."
            }
          },
          {
            "title": "L’iqâma",
            "text": "Avant la prière, on fait l’iqâma.",
            "ar": {
              "title": "الإقامة",
              "text": "يقيم قبل الصلاة."
            }
          },
          {
            "title": "La sourate après la Fâtiha",
            "text": "Après la Fâtiha, on récite une autre sourate, debout.",
            "image": "/assets/quiz/priere-debout.svg",
            "imageAlt": "Debout pendant la récitation",
            "ar": {
              "title": "السورة بعد الفاتحة",
              "text": "يقرأ بعد الفاتحة سورة وهو قائم."
            }
          },
          {
            "title": "À voix haute ou à voix basse",
            "text": "On récite à voix haute dans les prières à voix haute, et à voix basse dans les autres.",
            "ar": {
              "title": "الجهر والسرّ",
              "text": "يجهر فيما يُجهر فيه، ويُسرّ فيما يُسرّ فيه."
            }
          },
          {
            "title": "Les autres « Allahou Akbar »",
            "text": "Tous les « Allahou Akbar » sont des sunna, sauf le premier. En se relevant du roukou’, on dit « Sami’allâhou liman hamidah ».",
            "ar": {
              "title": "التكبير والتسميع",
              "text": "كل تكبيرة سنّة إلا تكبيرة الإحرام. ويقول عند الرفع من الركوع: سمع الله لمن حمده."
            }
          },
          {
            "title": "Le tachahhoud, assis",
            "text": "Les deux tachahhoud (attahiyyâtou), et la position assise pour les dire, sont des sunna. On y ajoute la prière sur le Prophète (PSL).",
            "image": "/assets/quiz/priere-assis.svg",
            "imageAlt": "Assis pour le tachahhoud",
            "ar": {
              "title": "التشهّد والجلوس له",
              "text": "التشهّدان والجلوس لهما سنّة، ومعهما الصلاة على النبي ﷺ."
            }
          },
          {
            "title": "La prosternation complète",
            "text": "On se prosterne aussi sur le nez, les mains, les genoux et le bout des orteils.",
            "image": "/assets/quiz/priere-soujoud.svg",
            "imageAlt": "Prosternation",
            "ar": {
              "title": "السجود على الأعضاء",
              "text": "يسجد أيضا على الأنف واليدين والركبتين وأطراف القدمين."
            }
          }
        ]
      }
    },
    {
      "id": "notre-dahira",
      "title": "Notre dahira",
      "description": "Son histoire, son nom et son guide.",
      "icon": "ph-users-three",
      "questions": [
        {
          "question": "En quelle année le dahira a-t-il été fondé ?",
          "choices": [
            "1999",
            "2012",
            "1985"
          ],
          "answer": 0,
          "explanation": "Le dahira est né à Yeumbeul en 1999.",
          "ar": {
            "question": "في أي سنة تأسّست الدائرة؟",
            "choices": [
              "1999",
              "2012",
              "1985"
            ],
            "explanation": "وُلدت الدائرة في يمبول سنة 1999."
          }
        },
        {
          "question": "Dans quelle localité le dahira est-il né ?",
          "choices": [
            "Yeumbeul",
            "Tivaouane",
            "Saint-Louis"
          ],
          "answer": 0,
          "explanation": "Des fidèles de Yeumbeul ont fondé le dahira en 1999.",
          "ar": {
            "question": "في أي بلدة وُلدت الدائرة؟",
            "choices": [
              "يمبول",
              "تيواون",
              "سان لويس"
            ],
            "explanation": "أسّس أهل يمبول الدائرة سنة 1999."
          }
        },
        {
          "question": "Que signifie « Moutahabina Fillahi » ?",
          "choices": [
            "Ceux qui s'aiment pour Dieu",
            "Ceux qui voyagent pour Dieu",
            "Les gardiens du savoir"
          ],
          "answer": 0,
          "explanation": "Moutahabina Fillahi : « ceux qui s'aiment pour Dieu ».",
          "ar": {
            "question": "ما معنى «متحابّين في الله»؟",
            "choices": [
              "الذين يتحابّون في الله",
              "الذين يسافرون في الله",
              "حرّاس العلم"
            ],
            "explanation": "متحابّين في الله: الذين يحبّ بعضهم بعضا في الله."
          }
        },
        {
          "question": "Sous la guidance de qui le dahira a-t-il été fondé ?",
          "choices": [
            "Serigne Mansour Sy « Borom Daaraji »",
            "Serigne Babacar Sy",
            "Seydi El Hadji Malick Sy"
          ],
          "answer": 0,
          "explanation": "Serigne Mansour Sy « Borom Daaraji » guidait le dahira dès sa fondation en 1999.",
          "choiceImages": [
            "/assets/tenants/moutahabina/lignee/serigne-mansour-sy.webp",
            "/assets/tenants/moutahabina/lignee/serigne-babacar-sy.webp",
            "/assets/tenants/moutahabina/lignee/seydi-el-hadji-malick-sy.webp"
          ],
          "ar": {
            "question": "بإرشاد من تأسّست الدائرة؟",
            "choices": [
              "الشيخ منصور سي «بورم دارجي»",
              "الشيخ أبو بكر سي",
              "السيد الحاج مالك سي"
            ],
            "explanation": "كان الشيخ منصور سي «بورم دارجي» مرشد الدائرة منذ تأسيسها سنة 1999."
          }
        },
        {
          "question": "Depuis quelle année Serigne Mame Malick Sy guide-t-il le dahira ?",
          "choices": [
            "2012",
            "1999",
            "2020"
          ],
          "answer": 0,
          "explanation": "Après le rappel à Dieu de Serigne Mansour Sy en 2012, son fils Serigne Mame Malick Sy guide le dahira.",
          "image": "/assets/tenants/moutahabina/lignee/serigne-mame-malick-sy.webp",
          "imageAlt": "Portrait de Serigne Mame Malick Sy",
          "ar": {
            "question": "منذ أي سنة يرشد الشيخ مام مالك سي الدائرة؟",
            "choices": [
              "2012",
              "1999",
              "2020"
            ],
            "explanation": "بعد انتقال الشيخ منصور سي إلى رحمة الله سنة 2012، يرشد ابنه الشيخ مام مالك سي الدائرة."
          }
        },
        {
          "question": "Quelle est la devise du dahira ?",
          "choices": [
            "S'aimer pour Dieu, servir ensemble.",
            "Apprendre avant de parler.",
            "Le travail avant tout."
          ],
          "answer": 0,
          "explanation": "« S'aimer pour Dieu, servir ensemble » : c'est le sens même de Moutahabina Fillahi.",
          "ar": {
            "question": "ما شعار الدائرة؟",
            "choices": [
              "نتحابّ في الله، ونخدم معا.",
              "تعلّم قبل أن تتكلّم.",
              "العمل قبل كل شيء."
            ],
            "explanation": "«نتحابّ في الله، ونخدم معا»: هذا هو معنى متحابّين في الله."
          }
        }
      ],
      "category": "Le dahira",
      "ar": {
        "title": "دائرتنا",
        "description": "تاريخها واسمها ومرشدها."
      }
    },
    {
      "id": "lignee-de-tivaouane",
      "title": "La lignée de Tivaouane",
      "description": "Quatre générations au service du savoir.",
      "icon": "ph-book-open-text",
      "questions": [
        {
          "question": "Quel surnom donne-t-on à Seydi El Hadji Malick Sy ?",
          "choices": [
            "Maodo",
            "Borom Daaraji",
            "Borom bonnet carré"
          ],
          "answer": 0,
          "explanation": "Seydi El Hadji Malick Sy est appelé « Maodo ».",
          "image": "/assets/tenants/moutahabina/lignee/seydi-el-hadji-malick-sy.webp",
          "imageAlt": "Portrait de Seydi El Hadji Malick Sy",
          "ar": {
            "question": "ما لقب السيد الحاج مالك سي؟",
            "choices": [
              "ماودو",
              "بورم دارجي",
              "صاحب القلنسوة المربّعة"
            ],
            "explanation": "يُلقّب السيد الحاج مالك سي بـ«ماودو»."
          }
        },
        {
          "question": "Dans quelle ville Seydi El Hadji Malick Sy a-t-il fondé sa grande école ?",
          "choices": [
            "Tivaouane",
            "Kaolack",
            "Ziguinchor"
          ],
          "answer": 0,
          "explanation": "À Tivaouane, il fonde la zawiya et une grande école. Beaucoup de muqaddams y ont été formés.",
          "ar": {
            "question": "في أي مدينة أسّس السيد الحاج مالك سي مدرسته الكبرى؟",
            "choices": [
              "تيواون",
              "كولخ",
              "زيغنشور"
            ],
            "explanation": "في تيواون أسّس الزاوية ومدرسة كبرى، وتخرّج فيها كثير من المقدّمين."
          }
        },
        {
          "question": "En quelle année Seydi El Hadji Malick Sy est-il rappelé à Dieu ?",
          "choices": [
            "1922",
            "1957",
            "1902"
          ],
          "answer": 0,
          "explanation": "Il est rappelé à Dieu le 27 juin 1922.",
          "ar": {
            "question": "في أي سنة انتقل السيد الحاج مالك سي إلى رحمة الله؟",
            "choices": [
              "1922",
              "1957",
              "1902"
            ],
            "explanation": "انتقل إلى رحمة الله في 27 يونيو 1922."
          }
        },
        {
          "question": "Qui fut le premier Khalife général des Tidianes ?",
          "choices": [
            "Serigne Babacar Sy",
            "Serigne Mansour Sy",
            "Serigne Mame Malick Sy"
          ],
          "answer": 0,
          "explanation": "Serigne Babacar Sy devient le premier Khalife général des Tidianes en 1922, à 37 ans.",
          "choiceImages": [
            "/assets/tenants/moutahabina/lignee/serigne-babacar-sy.webp",
            "/assets/tenants/moutahabina/lignee/serigne-mansour-sy.webp",
            "/assets/tenants/moutahabina/lignee/serigne-mame-malick-sy.webp"
          ],
          "ar": {
            "question": "من كان أول خليفة عام للتجانيين؟",
            "choices": [
              "الشيخ أبو بكر سي",
              "الشيخ منصور سي",
              "الشيخ مام مالك سي"
            ],
            "explanation": "صار الشيخ أبو بكر سي أول خليفة عام للتجانيين سنة 1922، وعمره 37 سنة."
          }
        },
        {
          "question": "Quel surnom porte Serigne Babacar Sy ?",
          "choices": [
            "Borom bonnet carré",
            "Maodo",
            "Borom Daaraji"
          ],
          "answer": 0,
          "explanation": "Serigne Babacar Sy est appelé « Borom bonnet carré ».",
          "image": "/assets/tenants/moutahabina/lignee/serigne-babacar-sy.webp",
          "imageAlt": "Portrait de Serigne Babacar Sy",
          "ar": {
            "question": "ما لقب الشيخ أبو بكر سي؟",
            "choices": [
              "صاحب القلنسوة المربّعة",
              "ماودو",
              "بورم دارجي"
            ],
            "explanation": "يُلقّب الشيخ أبو بكر سي بـ«صاحب القلنسوة المربّعة»."
          }
        },
        {
          "question": "Quel rôle Serigne Babacar Sy a-t-il joué pour les dahiras ?",
          "choices": [
            "Il a initié les premiers dahiras",
            "Il a interdit les dahiras",
            "Aucun rôle particulier"
          ],
          "answer": 0,
          "explanation": "Il a lancé les premiers dahiras, comme la Dahiratoul Kiram, pour s'entraider et apprendre ensemble.",
          "ar": {
            "question": "ما دور الشيخ أبو بكر سي في الدوائر؟",
            "choices": [
              "أسّس أولى الدوائر",
              "منع الدوائر",
              "لا دور خاص"
            ],
            "explanation": "أسّس أولى الدوائر، مثل دائرة الكرام، للتعاون والتعلّم معا."
          }
        },
        {
          "question": "Pourquoi Serigne Mansour Sy est-il appelé « Borom Daaraji » ?",
          "choices": [
            "Il a dirigé le grand daara fondé par son grand-père",
            "C'est le nom de son village natal",
            "C'est le nom de son premier livre"
          ],
          "answer": 0,
          "explanation": "Pendant de longues années, il a dirigé le grand daara de Tivaouane fondé par Maodo.",
          "image": "/assets/tenants/moutahabina/lignee/serigne-mansour-sy.webp",
          "imageAlt": "Portrait de Serigne Mansour Sy",
          "ar": {
            "question": "لماذا يُلقّب الشيخ منصور سي بـ«بورم دارجي»؟",
            "choices": [
              "لأنه أدار الدار الكبرى التي أسّسها جدّه",
              "هو اسم قريته",
              "هو اسم أول كتبه"
            ],
            "explanation": "أدار سنوات طويلة دار تيواون الكبرى التي أسّسها ماودو."
          }
        },
        {
          "question": "Qui est le père de notre guide, Serigne Mame Malick Sy ?",
          "choices": [
            "Serigne Mansour Sy",
            "Serigne Babacar Sy",
            "Seydi El Hadji Malick Sy"
          ],
          "answer": 0,
          "explanation": "Serigne Mame Malick Sy est le fils de Serigne Mansour Sy « Borom Daaraji ».",
          "choiceImages": [
            "/assets/tenants/moutahabina/lignee/serigne-mansour-sy.webp",
            "/assets/tenants/moutahabina/lignee/serigne-babacar-sy.webp",
            "/assets/tenants/moutahabina/lignee/seydi-el-hadji-malick-sy.webp"
          ],
          "ar": {
            "question": "من والد مرشدنا الشيخ مام مالك سي؟",
            "choices": [
              "الشيخ منصور سي",
              "الشيخ أبو بكر سي",
              "السيد الحاج مالك سي"
            ],
            "explanation": "الشيخ مام مالك سي هو ابن الشيخ منصور سي «بورم دارجي»."
          }
        }
      ],
      "category": "Le dahira",
      "ar": {
        "title": "سلسلة تيواون",
        "description": "أربعة أجيال في خدمة العلم."
      }
    },
    {
      "id": "notre-charte",
      "title": "Notre charte",
      "description": "Les engagements des membres et le déroulement d'un dahira.",
      "icon": "ph-scroll",
      "questions": [
        {
          "question": "Quelle tenue est obligatoire au dahira ?",
          "choices": [
            "La tenue blanche (ou une tenue correcte)",
            "Une tenue verte",
            "Aucune tenue particulière"
          ],
          "answer": 0,
          "explanation": "La charte demande une tenue blanche, ou à défaut une tenue correcte.",
          "ar": {
            "question": "ما اللباس المطلوب في الدائرة؟",
            "choices": [
              "اللباس الأبيض (أو لباس لائق)",
              "لباس أخضر",
              "لا لباس معيّن"
            ],
            "explanation": "يطلب الميثاق اللباس الأبيض، أو لباسا لائقا."
          }
        },
        {
          "question": "À quelle heure commence le dahira ?",
          "choices": [
            "20 h 30",
            "20 h 00",
            "22 h 10"
          ],
          "answer": 0,
          "explanation": "Le dahira commence à 20 h 30 et se termine à 23 h 00.",
          "ar": {
            "question": "متى تبدأ الدائرة؟",
            "choices": [
              "الساعة 20:30",
              "الساعة 20:00",
              "الساعة 22:10"
            ],
            "explanation": "تبدأ الدائرة الساعة 20:30 وتنتهي الساعة 23:00."
          }
        },
        {
          "question": "Que se passe-t-il de 22 h 10 à 22 h 50 ?",
          "choices": [
            "L'Oustaz",
            "Les nabiens",
            "Les informations"
          ],
          "answer": 0,
          "explanation": "Nabiens de 20 h 30 à 22 h 10, puis l’Oustaz de 22 h 10 à 22 h 50, et les informations à 22 h 50.",
          "ar": {
            "question": "ماذا يكون من الساعة 22:10 إلى 22:50؟",
            "choices": [
              "الأستاذ",
              "المدائح النبوية",
              "الإعلانات"
            ],
            "explanation": "المدائح النبوية من 20:30 إلى 22:10، ثم الأستاذ من 22:10 إلى 22:50، ثم الإعلانات الساعة 22:50."
          }
        },
        {
          "question": "Combien chaque membre cotise-t-il pour un baptême ou un mariage ?",
          "choices": [
            "1 000 F CFA",
            "2 000 F CFA",
            "4 000 F CFA"
          ],
          "answer": 0,
          "explanation": "Pour un baptême ou un mariage, chaque membre cotise 1 000 F CFA.",
          "ar": {
            "question": "كم يساهم كل عضو في العقيقة أو الزواج؟",
            "choices": [
              "1000 فرنك",
              "2000 فرنك",
              "4000 فرنك"
            ],
            "explanation": "في العقيقة أو الزواج يساهم كل عضو بـ1000 فرنك."
          }
        },
        {
          "question": "Combien un membre donne-t-il le jour où il reçoit le dahira ?",
          "choices": [
            "4 000 F CFA",
            "1 000 F CFA",
            "2 000 F CFA"
          ],
          "answer": 0,
          "explanation": "4 000 F CFA : 2 000 pour la sonorisation et 2 000 pour le thé (ataya).",
          "ar": {
            "question": "كم يدفع العضو يوم استضافته للدائرة؟",
            "choices": [
              "4000 فرنك",
              "1000 فرنك",
              "2000 فرنك"
            ],
            "explanation": "4000 فرنك: 2000 للصوتيات و2000 للشاي (أتايا)."
          }
        },
        {
          "question": "Que veut dire « Yar ak téguine » ?",
          "choices": [
            "La discipline",
            "La présence",
            "La tenue correcte"
          ],
          "answer": 0,
          "explanation": "« Yar ak téguine » : la discipline, l'un des engagements de la charte.",
          "ar": {
            "question": "ما معنى «يار اك تيغين»؟",
            "choices": [
              "الانضباط",
              "الحضور",
              "اللباس اللائق"
            ],
            "explanation": "«يار اك تيغين»: الانضباط، وهو من التزامات الميثاق."
          }
        },
        {
          "question": "À quoi correspond « Téw tay téwal » ?",
          "choices": [
            "La présence physique et financière",
            "La discipline",
            "La carte de membre"
          ],
          "answer": 0,
          "explanation": "« Téw tay téwal » : être présent, physiquement et financièrement.",
          "ar": {
            "question": "ما المقصود بـ«تيو تاي تيوال»؟",
            "choices": [
              "الحضور بالبدن والمال",
              "الانضباط",
              "بطاقة العضوية"
            ],
            "explanation": "«تيو تاي تيوال»: الحضور بالبدن والمال."
          }
        }
      ],
      "category": "Le dahira",
      "ar": {
        "title": "ميثاقنا",
        "description": "التزامات الأعضاء وسير الدائرة."
      }
    }
  ]
}$quiz$::jsonb
where adresse = 'moutahabina'
  and quiz = $ancien${"intro": "Écoutez de courtes leçons, puis jouez : la Wazifa, le Lazim, les chartes, les ablutions, la prière et le dahira. Pas besoin de compte.", "themes": [{"ar": {"title": "الوظيفة", "description": "ما هي، ومتى وكيف تؤدّى."}, "id": "wazifa", "icon": "ph-users", "title": "La Wazifa", "lesson": {"cards": [{"ar": {"text": "الوظيفة ذكر من أذكار الطريقة التجانية، وهي من الأوراد اللازمة للمريد. تؤخذ بإذن من مقدّم مأذون.", "title": "ما هي الوظيفة؟"}, "text": "La Wazifa est une prière de la Tidjaniya. Elle fait partie des obligations du talibé. On la reçoit avec l’autorisation d’un moukadam.", "title": "Qu’est-ce que la Wazifa ?"}, {"ar": {"text": "مرة في اليوم على الأقل، ومرتين صباحا ومساء أفضل. ومن أدّاها مرة واحدة فوقتها من العصر إلى عصر اليوم التالي.", "title": "متى تؤدّى؟"}, "text": "Au moins une fois par jour. Deux fois, matin et soir, c’est mieux. Si on la fait une seule fois : entre Takussan et le Takussan du lendemain.", "title": "Quand la faire ?"}, {"ar": {"text": "تؤدّى الوظيفة جماعة إن أمكن، جلوسا في صفوف وبصوت واحد مرتفع. ومن كان وحده قرأها بصوت يُسمع به نفسه، جالسا مستقبل القبلة.", "title": "جماعة وبصوت مرتفع"}, "text": "Si possible, on fait la Wazifa en groupe, assis en rangs, à voix haute et ensemble. Seul, on la récite doucement mais en s’entendant, assis et tourné vers la qibla.", "title": "Ensemble, à voix haute"}, {"ar": {"text": "أولا: أستغفر الله ثلاثين مرة. ثم صلاة الفاتح خمسين مرة. ثم لا إله إلا الله مائة مرة. وأخيرا جوهرة الكمال اثنتي عشرة مرة.", "title": "أجزاؤها الأربعة"}, "text": "D’abord 30 fois Astaghfirullah. Ensuite 50 fois Salatul Fatihi. Puis 100 fois Lâ ilâha illallâh. Enfin 12 fois Djawharatul Kamal.", "title": "Les quatre parties"}, {"ar": {"text": "لا تُقرأ إلا بطهارة مائية، في مكان طاهر، جلوسا، بثياب طاهرة. فإن تعذّر ذلك، كفقد الماء أو الركوب، قُرئت صلاة الفاتح عشرين مرة بدلها.", "title": "جوهرة الكمال"}, "text": "On la récite seulement avec les ablutions faites à l’eau, dans un lieu propre, assis, avec des habits propres. Si ce n’est pas possible, par exemple sans eau ou en voiture, on récite 20 fois Salatul Fatihi à la place.", "title": "La Djawharatul Kamal"}, {"ar": {"text": "لا يُصلّى على النبي ﷺ في الوظيفة إلا بصلاة الفاتح. وفي الجماعة يلزم مكان طاهر يسع ستة أشخاص على الأقل.", "title": "للحفظ"}, "text": "Pendant la Wazifa, la seule prière sur le Prophète est la Salatul Fatihi. En groupe, il faut un lieu propre où tiennent au moins six personnes.", "title": "À retenir"}]}, "category": "La Tariqa", "questions": [{"answer": 0, "choices": ["30 fois", "100 fois", "12 fois"], "question": "Combien de fois dit-on Astaghfirullah dans la Wazifa ?", "explanation": "Dans la Wazifa, on dit 30 fois Astaghfirullah."}, {"answer": 0, "choices": ["50 fois", "30 fois", "20 fois"], "question": "Combien de fois récite-t-on la Salatul Fatihi ?", "explanation": "On récite 50 fois la Salatul Fatihi."}, {"answer": 0, "choices": ["100 fois", "50 fois", "12 fois"], "question": "Combien de fois dit-on Lâ ilâha illallâh ?", "explanation": "On dit 100 fois Lâ ilâha illallâh."}, {"answer": 0, "choices": ["12 fois", "30 fois", "100 fois"], "question": "Combien de fois récite-t-on la Djawharatul Kamal ?", "explanation": "On récite 12 fois la Djawharatul Kamal."}, {"answer": 0, "choices": ["20 fois Salatul Fatihi", "Rien du tout", "100 fois Astaghfirullah"], "question": "Sans eau pour les ablutions, que récite-t-on à la place de la Djawharatul Kamal ?", "explanation": "On récite 20 fois la Salatul Fatihi à la place."}, {"answer": 0, "choices": ["En groupe, à voix haute", "Seul, sans parler", "Debout en marchant"], "question": "Comment fait-on la Wazifa, si possible ?", "explanation": "Si possible, en groupe, assis en rangs, à voix haute et ensemble."}], "description": "Ce que c’est, quand et comment la faire."}, {"ar": {"title": "اللازم", "description": "الورد اللازم صباحا ومساء."}, "id": "lazim", "icon": "ph-clock", "title": "Le Lazim", "lesson": {"cards": [{"ar": {"text": "اللازم هو الورد الواجب على المريد. يؤدّى مرتين في اليوم، صباحا ومساء، فرديا وسرّا. ويؤخذ عن مقدّم مأذون.", "title": "ما هو اللازم؟"}, "text": "Le Lazim, c’est le wird obligatoire du talibé. On le fait deux fois par jour, le matin et le soir, seul et à voix basse. On le reçoit d’un moukadam autorisé.", "title": "Qu’est-ce que le Lazim ?"}, {"ar": {"text": "أولا: أستغفر الله مائة مرة. ثم الصلاة على النبي ﷺ مائة مرة، وأفضلها صلاة الفاتح. ثم لا إله إلا الله مائة مرة، ويختم بقول: محمد رسول الله عليه سلام الله.", "title": "أجزاؤه الثلاثة"}, "text": "D’abord 100 fois Astaghfirullah. Ensuite 100 fois la prière sur le Prophète ; la meilleure est la Salatul Fatihi. Enfin 100 fois Lâ ilâha illallâh, et on termine par Muhammadun Rasûlullâh, alayhi salâmullâh.", "title": "Les trois parties"}, {"ar": {"text": "من بعد صلاة الصبح إلى الضحى. ولصاحب العذر أن يؤدّيه إلى المغرب. ويجوز تقديمه ليلا بعد العشاء، على أن يتمّ قبل أذان الفجر.", "title": "لازم الصباح"}, "text": "Après la prière de Fajar, jusqu’au milieu de la matinée. Avec une bonne excuse, on peut encore le faire jusqu’à Timis. On peut aussi l’avancer la nuit, après Guéwé, mais il doit être fini avant l’appel de Fajar.", "title": "Le Lazim du matin"}, {"ar": {"text": "من بعد صلاة العصر إلى العشاء. ولصاحب العذر أن يؤدّيه إلى الفجر.", "title": "لازم المساء"}, "text": "Après Takussan, jusqu’à Guéwé. Avec une bonne excuse, on peut encore le faire jusqu’à Fajar.", "title": "Le Lazim du soir"}, {"ar": {"text": "النية، والطهارة، وطهارة البدن والثوب والمكان، وستر العورة كما في الصلاة. وترك الكلام إلا لضرورة، وترك الأكل والشرب. فإن اختلّ شرط منها وجبت إعادته.", "title": "شروط صحّته"}, "text": "Avoir l’intention. Avoir fait ses ablutions. Corps, habits et lieu propres. Être bien couvert, comme pour la prière. Ne pas parler, sauf nécessité, et ne pas manger ni boire. S’il manque une de ces conditions, il faut le refaire.", "title": "Pour qu’il soit valable"}, {"ar": {"text": "الجلوس، واستقبال القبلة، والذكر بصوت خفيّ مع تحريك الشفتين، وحسن النطق دون إسراع. ومن فاته اللازم قضاه.", "title": "آدابه"}, "text": "S’asseoir. Se tourner vers la qibla. Réciter doucement, en bougeant les lèvres. Bien prononcer, sans aller trop vite. Un Lazim oublié doit être rattrapé.", "title": "Pour bien le faire"}]}, "category": "La Tariqa", "questions": [{"answer": 0, "choices": ["2 fois", "1 fois", "5 fois"], "question": "Combien de fois par jour fait-on le Lazim ?", "explanation": "Deux fois par jour : le matin et le soir."}, {"answer": 0, "choices": ["100 fois", "30 fois", "12 fois"], "question": "Combien de fois dit-on Astaghfirullah dans le Lazim ?", "explanation": "Dans le Lazim, chaque partie se dit 100 fois."}, {"answer": 0, "choices": ["La Salatul Fatihi", "La Djawharatul Kamal", "La Fâtiha"], "question": "Quelle est la meilleure prière sur le Prophète dans le Lazim ?", "explanation": "La meilleure prière sur le Prophète, c’est la Salatul Fatihi."}, {"answer": 0, "choices": ["Après Takussan", "Après Timis", "Après Fajar"], "question": "Quand commence le Lazim du soir ?", "explanation": "Le Lazim du soir se fait après Takussan, jusqu’à Guéwé."}, {"answer": 0, "choices": ["Non, sauf nécessité", "Oui, librement", "Seulement au téléphone"], "question": "Peut-on parler pendant le Lazim ?", "explanation": "On ne parle pas pendant le Lazim, sauf nécessité."}, {"answer": 0, "choices": ["Le rattraper", "Rien, c’est perdu", "Le faire deux fois le lendemain"], "question": "On a oublié le Lazim. Que faire ?", "explanation": "Un Lazim oublié doit être rattrapé."}], "description": "Le wird du matin et du soir."}, {"ar": {"title": "شروط الطريقة الثلاثة والعشرون", "description": "آداب المريد التجاني في خمسة أجزاء."}, "id": "chartes-tariqa", "icon": "ph-shield-check", "title": "Les 23 chartes de la Tariqa", "lesson": {"cards": [{"ar": {"text": "تلقّي الورد عن مقدّم مأذون، متّصل السند.", "title": "1. أخذ الورد عن مقدّم", "chapter": "تلقّي الورد"}, "text": "Recevoir le wird d’un moukadam autorisé, relié à la chaîne de transmission.", "title": "1. Le wird reçu d’un moukadam", "chapter": "Recevoir le wird"}, {"ar": {"text": "عدم أخذ ورد من طريقة أخرى.", "title": "2. ورد واحد", "chapter": "تلقّي الورد"}, "text": "Ne pas prendre de wird d’une autre tariqa.", "title": "2. Un seul wird", "chapter": "Recevoir le wird"}, {"ar": {"text": "عدم ذكر الورد إلا بعد الإذن فيه.", "title": "11. الإذن", "chapter": "تلقّي الورد"}, "text": "Faire le wird seulement après en avoir reçu l’autorisation.", "title": "11. L’autorisation", "chapter": "Recevoir le wird"}, {"ar": {"text": "عدم زيارة وليّ من غير أهل الطريقة، حيّا أو ميّتا، مع احترام علماء الطرق الأخرى.", "title": "3. الزيارة", "chapter": "تلقّي الورد"}, "text": "Ne pas faire de ziar auprès d’un saint qui n’est pas tidjane, vivant ou mort. Respecter quand même les savants des autres voies.", "title": "3. Le ziar", "chapter": "Recevoir le wird"}, {"ar": {"text": "عدم ادّعاء الولاية، ولا إعطاء الورد بغير إذن.", "title": "16. لا ادّعاء", "chapter": "تلقّي الورد"}, "text": "Ne pas se faire passer pour un saint, ni donner le wird sans autorisation.", "title": "16. Pas de faux titre", "chapter": "Recevoir le wird"}, {"ar": {"text": "محبّة الشيخ أحمد التجاني وخلفائه وتعظيمهم مدى الحياة.", "title": "5. محبّة الشيخ", "chapter": "محبّة الشيخ"}, "text": "Aimer et respecter Cheikh Ahmed Tidjani et ses khalifes, toute sa vie.", "title": "5. Aimer Cheikh", "chapter": "Aimer Cheikh"}, {"ar": {"text": "الاعتقاد الجازم في الشيخ وفي الطريقة.", "title": "9. الاعتقاد الجازم", "chapter": "محبّة الشيخ"}, "text": "Avoir une foi ferme en Cheikh et en la tariqa.", "title": "9. Une foi ferme", "chapter": "Aimer Cheikh"}, {"ar": {"text": "عدم معاداة الشيخ أو خلفائه.", "title": "7. ترك العداوة", "chapter": "محبّة الشيخ"}, "text": "N’avoir aucune hostilité envers Cheikh ou ses khalifes.", "title": "7. Aucune hostilité", "chapter": "Aimer Cheikh"}, {"ar": {"text": "عدم انتقاد الشيخ ولا الطريقة ولا الخلفاء ولا الإخوان.", "title": "10. ترك الانتقاد", "chapter": "محبّة الشيخ"}, "text": "Ne pas critiquer Cheikh, la tariqa, les khalifes ni les talibés.", "title": "10. Ne pas critiquer", "chapter": "Aimer Cheikh"}, {"ar": {"text": "عدم الأمن من مكر الله.", "title": "6. الخشية", "chapter": "محبّة الشيخ"}, "text": "Ne pas se croire à l’abri de ses fautes.", "title": "6. Rester humble", "chapter": "Aimer Cheikh"}, {"ar": {"text": "المداومة على الورد دون تركه إلى الممات.", "title": "8. حتى الممات", "chapter": "الورد كل يوم"}, "text": "Faire le wird sans jamais l’abandonner, jusqu’à la mort.", "title": "8. Jusqu’à la mort", "chapter": "Le wird chaque jour"}, {"ar": {"text": "عدم التهاون في الورد، ولا تأخيره عن وقته بغير عذر.", "title": "15. عدم التهاون", "chapter": "الورد كل يوم"}, "text": "Ne pas négliger le wird ni le faire en retard sans excuse.", "title": "15. Ne pas négliger", "chapter": "Le wird chaque jour"}, {"ar": {"text": "أداء الصلوات الخمس في جماعة إن أمكن.", "title": "4. الصلوات الخمس", "chapter": "الورد كل يوم"}, "text": "Faire les cinq prières en groupe, si possible.", "title": "4. Les cinq prières", "chapter": "Le wird chaque jour"}, {"ar": {"text": "أداء الوظيفة وهيللة الجمعة في جماعة.", "title": "12. الاجتماع", "chapter": "الورد كل يوم"}, "text": "Faire la Wazifa et la Hadratul Djouma du vendredi en groupe.", "title": "12. En groupe", "chapter": "Le wird chaque jour"}, {"ar": {"text": "عدم قطع الرحم، ولا قطيعة الإخوان في الطريقة.", "title": "14. صلة الرحم", "chapter": "الأخوّة"}, "text": "Ne pas couper les liens avec sa famille ni avec ses frères talibés.", "title": "14. Garder les liens", "chapter": "La fraternité"}, {"ar": {"text": "احترام كل من ينتسب إلى الشيخ أو إلى الطريقة.", "title": "17. الاحترام", "chapter": "الأخوّة"}, "text": "Respecter toute personne liée à Cheikh ou à la tariqa.", "title": "17. Le respect", "chapter": "La fraternité"}, {"ar": {"text": "عدم إغضاب الأخ في الطريقة.", "title": "18. الأخوّة", "chapter": "الأخوّة"}, "text": "Ne pas fâcher son frère talibé.", "title": "18. La fraternité", "chapter": "La fraternité"}, {"ar": {"text": "عدم قراءة جوهرة الكمال إلا بطهارة.", "title": "13. جوهرة الكمال", "chapter": "أثناء الورد"}, "text": "Ne réciter la Djawharatul Kamal qu’avec les ablutions.", "title": "13. La Djawharatul Kamal", "chapter": "Pendant le wird"}, {"ar": {"text": "الطهارة، وطهارة الثوب والمكان.", "title": "19. الطهارة", "chapter": "أثناء الورد"}, "text": "Être en état de pureté, avec des habits propres, dans un lieu propre.", "title": "19. La pureté", "chapter": "Pendant le wird"}, {"ar": {"text": "الجلوس مستقبل القبلة أثناء الورد، إلا لعذر.", "title": "20. القبلة", "chapter": "أثناء الورد"}, "text": "S’asseoir tourné vers la qibla pendant le wird, sauf exceptions.", "title": "20. La qibla", "chapter": "Pendant le wird"}, {"ar": {"text": "ترك الكلام أثناء الورد إلا لضرورة: كإجابة الوالدين، والزوجة لزوجها، والمريد لشيخه.", "title": "21. الصمت", "chapter": "أثناء الورد"}, "text": "Ne pas parler pendant le wird, sauf nécessité : répondre à ses parents, l’épouse à son mari, le talibé à son guide.", "title": "21. Le silence", "chapter": "Pendant le wird"}, {"ar": {"text": "التدبّر في ألفاظ الورد وحسن النطق بها.", "title": "22. التدبّر", "chapter": "أثناء الورد"}, "text": "Se concentrer sur les paroles du wird et bien les prononcer.", "title": "22. La concentration", "chapter": "Pendant le wird"}, {"ar": {"text": "استحضار صورة النبي ﷺ أو الشيخ أو المرشد.", "title": "23. الاستحضار", "chapter": "أثناء الورد"}, "text": "Ressentir la présence du Prophète, paix et salut sur lui, de Cheikh ou de son guide.", "title": "23. La présence", "chapter": "Pendant le wird"}]}, "category": "La Tariqa", "questions": [{"answer": 0, "choices": ["D’un moukadam autorisé", "De n’importe quel ami", "D’un livre"], "question": "De qui reçoit-on le wird ?", "explanation": "On reçoit le wird d’un moukadam autorisé, relié à la chaîne de transmission."}, {"answer": 0, "choices": ["Non", "Oui", "Seulement le vendredi"], "question": "Peut-on prendre le wird d’une autre tariqa ?", "explanation": "Le talibé tidjane ne prend pas de wird d’une autre tariqa."}, {"answer": 0, "choices": ["Jusqu’à la mort", "Pendant un an", "Pendant le Ramadan"], "question": "Jusqu’à quand fait-on le wird ?", "explanation": "On fait le wird sans jamais l’abandonner, jusqu’à la mort."}, {"answer": 0, "choices": ["Avec les ablutions", "Sans ablutions", "En marchant"], "question": "Avec quoi récite-t-on la Djawharatul Kamal ?", "explanation": "On ne récite la Djawharatul Kamal qu’avec les ablutions."}, {"answer": 0, "choices": ["En groupe", "Seul, en cachette", "On ne les fait pas"], "question": "Comment fait-on la Wazifa et la Hadratul Djouma ?", "explanation": "On les fait en groupe, si possible."}, {"answer": 0, "choices": ["Vers la qibla", "Vers la porte", "Peu importe"], "question": "Vers où se tourne-t-on pendant le wird ?", "explanation": "On s’assoit tourné vers la qibla, sauf exceptions."}, {"answer": 0, "choices": ["Non, sauf nécessité", "Oui, librement", "Seulement pour rire"], "question": "Peut-on parler pendant le wird ?", "explanation": "On ne parle pas pendant le wird, sauf nécessité : répondre à ses parents, l’épouse à son mari, le talibé à son guide."}, {"answer": 0, "choices": ["Garder les liens et ne pas les fâcher", "Les éviter", "Les critiquer"], "question": "Avec ses frères talibés, on doit…", "explanation": "On ne coupe pas les liens avec ses frères talibés et on ne les fâche pas."}], "description": "Les règles du talibé tidjane, en 5 parties."}, {"ar": {"title": "فرائض الوضوء", "description": "فرائض الوضوء السبع."}, "id": "farata-ndiapp", "icon": "ph-drop", "title": "Farata ndiapp", "lesson": {"cards": [{"ar": {"text": "فرائض الوضوء سبع، وهي أفعال واجبة لا يصحّ الوضوء بدونها.", "title": "فرائض الوضوء السبع"}, "text": "Il y a sept farata dans les ablutions. Ce sont les gestes obligatoires : sans eux, les ablutions ne sont pas valables.", "title": "Les sept farata"}, {"ar": {"text": "يبدأ بالنية: أن يقصد بقلبه أداء الوضوء.", "title": "1. النية"}, "text": "On commence par l’intention (niyya) : dans son cœur, on veut faire ses ablutions.", "title": "1. L’intention"}, {"ar": {"text": "يغسل الوجه كلّه، من منابت شعر الرأس إلى الذقن، ومن الأذن إلى الأذن.", "title": "2. غسل الوجه"}, "text": "On lave tout le visage, des cheveux jusqu’au menton, et d’une oreille à l’autre.", "image": "/assets/quiz/ablution-visage.svg", "title": "2. Le visage", "imageAlt": "Laver le visage"}, {"ar": {"text": "يغسل اليدين إلى المرفقين، والمرفقان داخلان، مع تخليل أصابع اليدين.", "title": "3. غسل اليدين إلى المرفقين"}, "text": "On lave les mains et les bras jusqu’aux coudes, coudes compris. On lave aussi entre les doigts.", "image": "/assets/quiz/ablution-bras-coudes.svg", "title": "3. Les bras jusqu’aux coudes", "imageAlt": "Laver les bras jusqu’aux coudes"}, {"ar": {"text": "يمسح الرأس باليدين المبلولتين.", "title": "4. مسح الرأس"}, "text": "On passe les mains mouillées sur la tête.", "image": "/assets/quiz/ablution-tete.svg", "title": "4. La tête : le massah", "imageAlt": "Passer les mains mouillées sur la tête"}, {"ar": {"text": "يغسل الرجلين إلى الكعبين، والكعبان داخلان.", "title": "5. غسل الرجلين إلى الكعبين"}, "text": "On lave les pieds jusqu’aux chevilles, chevilles comprises.", "image": "/assets/quiz/ablution-pieds-chevilles.svg", "title": "5. Les pieds jusqu’aux chevilles", "imageAlt": "Laver les pieds jusqu’aux chevilles"}, {"ar": {"text": "الدلك: إمرار اليد على العضو مع الغسل. والفور: الموالاة بين الأعضاء دون تفريق طويل.", "title": "6 و7. الدلك والفور"}, "text": "On frotte chaque membre en le lavant : c’est le dalk. On enchaîne les ablutions sans longue pause : c’est le fawr.", "title": "6 et 7. Le dalk et le fawr"}, {"ar": {"text": "إن تذكّره بالقرب فعله وما بعده. وإن طال فعله وحده، وأعاد ما صلّى بعده.", "title": "من نسي فرضا"}, "text": "Si on s’en rend compte vite, on la fait, puis on refait ce qui vient après. Si on s’en rend compte tard, on la fait seule, et on refait les prières faites depuis.", "title": "Si on oublie une farata"}]}, "source": "Mukhtasar d'Al-Akhdari (rite malikite)", "category": "Ablutions et prière", "questions": [{"ar": {"choices": ["سبع", "خمس", "عشر"], "question": "كم عدد فرائض الوضوء؟", "explanation": "فرائض الوضوء سبع."}, "answer": 0, "choices": ["7", "5", "10"], "question": "Combien y a-t-il de farata dans les ablutions ?", "explanation": "Il y a sept farata dans les ablutions."}, {"ar": {"choices": ["النية", "المضمضة", "مسح الأذنين"], "question": "ما أول فرائض الوضوء؟", "explanation": "أول فرائض الوضوء النية، تكون عند الشروع فيه."}, "answer": 0, "choices": ["L'intention (niyya)", "Se rincer la bouche", "Se laver les oreilles"], "question": "Quelle est la première farata des ablutions ?", "explanation": "La première farata, c'est l'intention, au début des ablutions."}, {"ar": {"choices": ["إلى المرفقين", "إلى الكوعين", "إلى المنكبين"], "question": "إلى أين تُغسل اليدان؟", "explanation": "من فرائض الوضوء غسل اليدين إلى المرفقين."}, "answer": 0, "choices": ["Jusqu'aux coudes", "Jusqu'aux poignets", "Jusqu'aux épaules"], "question": "Jusqu'où faut-il laver les bras ?", "explanation": "On lave les bras jusqu'aux coudes.", "choiceImages": ["/assets/quiz/ablution-bras-coudes.svg", "/assets/quiz/ablution-mains-poignets.svg", "/assets/quiz/ablution-bras-epaules.svg"]}, {"ar": {"choices": ["يُمسح باليدين المبلولتين", "يُغسل كله", "لا شيء"], "question": "ماذا يُفعل بالرأس في الوضوء؟", "explanation": "من فرائض الوضوء مسح الرأس."}, "image": "/assets/quiz/ablution-tete.svg", "answer": 0, "choices": ["Passer les mains mouillées dessus (massah)", "La laver entièrement", "Rien"], "imageAlt": "Les mains mouillées passent sur la tête", "question": "Pour la tête, que faut-il faire ?", "explanation": "On passe les mains mouillées sur la tête : c'est le massah."}, {"ar": {"choices": ["إلى الكعبين", "إلى الركبتين", "الأصابع فقط"], "question": "إلى أين تُغسل الرجلان؟", "explanation": "من فرائض الوضوء غسل الرجلين إلى الكعبين."}, "answer": 0, "choices": ["Jusqu'aux chevilles", "Jusqu'aux genoux", "Seulement les orteils"], "question": "Jusqu'où faut-il laver les pieds ?", "explanation": "On lave les pieds jusqu'aux chevilles.", "choiceImages": ["/assets/quiz/ablution-pieds-chevilles.svg", "/assets/quiz/ablution-pieds-genoux.svg", "/assets/quiz/ablution-orteils.svg"]}, {"ar": {"choices": ["إمرار اليد على العضو مع الغسل", "الغسل ثلاث مرات", "البداية باليمنى"], "question": "ما هو الدلك؟", "explanation": "الدلك من فرائض الوضوء."}, "answer": 0, "choices": ["Frotter les membres en les lavant", "Laver trois fois", "Commencer par la droite"], "question": "Que veut dire « dalk » ?", "explanation": "Le dalk, c'est frotter chaque membre en le lavant. C'est une obligation."}, {"ar": {"choices": ["الموالاة بين الأعضاء دون تفريق طويل", "الإسراع الشديد", "كثرة الماء"], "question": "ما هو الفور؟", "explanation": "الفور من فرائض الوضوء."}, "answer": 0, "choices": ["Enchaîner les ablutions sans s'arrêter longtemps", "Faire très vite", "Utiliser beaucoup d'eau"], "question": "Que veut dire « fawr » ?", "explanation": "Le fawr, c'est enchaîner les ablutions sans s'arrêter longtemps."}, {"ar": {"choices": ["يفعله ويفعل ما بعده", "لا شيء عليه", "ينتظر الصلاة القادمة"], "question": "من نسي فرضا من أعضائه وتذكره بالقرب، ماذا يفعل؟", "explanation": "من نسي فرضا فإن تذكره بالقرب فعله وما بعده."}, "answer": 0, "choices": ["La faire, puis ce qui vient après", "Ne rien faire", "Attendre la prochaine prière"], "question": "On a oublié une farata et on s'en souvient tout de suite. Que faire ?", "explanation": "Si on s'en souvient vite, on fait la farata oubliée, puis ce qui vient après."}], "description": "Ce qui est obligatoire dans les ablutions."}, {"ar": {"title": "سنن الوضوء", "description": "فرض أم سنة؟ سنن الوضوء."}, "id": "sunna-ndiapp", "icon": "ph-drop-half", "title": "Sunna ndiapp", "lesson": {"cards": [{"ar": {"text": "السنن مؤكّدة، فلا تُترك عمدا. وهي ثمان.", "title": "سنن الوضوء"}, "text": "Les sunna sont fortement recommandées. On ne les laisse pas exprès. Il y en a huit.", "title": "Les sunna des ablutions"}, {"ar": {"text": "يغسل اليدين إلى الكوعين عند الشروع.", "title": "غسل اليدين إلى الكوعين"}, "text": "Au début, on se lave les mains jusqu’aux poignets.", "image": "/assets/quiz/ablution-mains-poignets.svg", "title": "Les mains jusqu’aux poignets", "imageAlt": "Laver les mains jusqu’aux poignets"}, {"ar": {"text": "يُدخل الماء في فمه ويحرّكه ثم يمجّه.", "title": "المضمضة"}, "text": "On met de l’eau dans la bouche, on la remue, puis on la recrache.", "image": "/assets/quiz/ablution-bouche.svg", "title": "La bouche : la madmada", "imageAlt": "Se rincer la bouche"}, {"ar": {"text": "يجذب الماء بأنفه وهو الاستنشاق، ثم ينثره وهو الاستنثار.", "title": "الأنف"}, "text": "On aspire un peu d’eau par le nez (istinchâq), puis on la rejette (istinthâr).", "image": "/assets/quiz/ablution-nez.svg", "title": "Le nez", "imageAlt": "Aspirer l’eau par le nez"}, {"ar": {"text": "بعد مسح الرأس يردّ يديه من مؤخّر الرأس إلى مقدّمه.", "title": "ردّ مسح الرأس"}, "text": "Après le massah de la tête, on repasse les mains en sens inverse.", "image": "/assets/quiz/ablution-tete.svg", "title": "La tête, aller et retour", "imageAlt": "Passer les mains sur la tête"}, {"ar": {"text": "يمسح الأذنين ويجدّد لهما الماء.", "title": "الأذنان"}, "text": "On essuie les oreilles, en reprenant de l’eau pour elles.", "image": "/assets/quiz/ablution-oreilles.svg", "title": "Les oreilles", "imageAlt": "Essuyer les oreilles"}, {"ar": {"text": "الترتيب بين الفرائض: الوجه، ثم اليدان، ثم الرأس، ثم الرجلان.", "title": "الترتيب"}, "text": "On fait les farata dans l’ordre : le visage, les bras, la tête, puis les pieds.", "title": "L’ordre"}, {"ar": {"text": "يفعلها وحدها، ولا يعيد الصلاة.", "title": "من نسي سنّة"}, "text": "On fait seulement la sunna oubliée. Pas besoin de refaire la prière.", "title": "Si on oublie une sunna"}, {"ar": {"text": "التسمية، والسواك، والغسلة الثانية والثالثة للوجه واليدين، والبدء بالميامن، وقلّة الماء.", "title": "الفضائل"}, "text": "Dire « Bismillah », utiliser le cure-dents (siwak), laver le visage et les bras une deuxième et une troisième fois, commencer par la droite, et ne pas gaspiller l’eau.", "title": "Les gestes qui apportent du mérite"}]}, "source": "Mukhtasar d'Al-Akhdari (rite malikite)", "category": "Ablutions et prière", "keepOrder": true, "questions": [{"ar": {"choices": ["فرض", "سنة"], "question": "المضمضة", "explanation": "المضمضة من سنن الوضوء."}, "image": "/assets/quiz/ablution-bouche.svg", "answer": 1, "choices": ["Farata (obligatoire)", "Sunna (recommandée)"], "imageAlt": "Se rincer la bouche", "question": "Se rincer la bouche (madmada)", "explanation": "Se rincer la bouche est une sunna des ablutions."}, {"ar": {"choices": ["فرض", "سنة"], "question": "الاستنشاق", "explanation": "الاستنشاق من سنن الوضوء."}, "image": "/assets/quiz/ablution-nez.svg", "answer": 1, "choices": ["Farata (obligatoire)", "Sunna (recommandée)"], "imageAlt": "Aspirer l’eau par le nez", "question": "Aspirer l'eau par le nez (istinchâq)", "explanation": "Aspirer l'eau par le nez est une sunna."}, {"ar": {"choices": ["فرض", "سنة"], "question": "غسل الوجه", "explanation": "غسل الوجه من فرائض الوضوء."}, "image": "/assets/quiz/ablution-visage.svg", "answer": 0, "choices": ["Farata (obligatoire)", "Sunna (recommandée)"], "imageAlt": "Laver le visage", "question": "Laver le visage", "explanation": "Laver le visage est une farata."}, {"ar": {"choices": ["فرض", "سنة"], "question": "مسح الأذنين", "explanation": "مسح الأذنين وتجديد الماء لهما من سنن الوضوء."}, "image": "/assets/quiz/ablution-oreilles.svg", "answer": 1, "choices": ["Farata (obligatoire)", "Sunna (recommandée)"], "imageAlt": "Essuyer les oreilles", "question": "Essuyer les oreilles", "explanation": "Essuyer les oreilles est une sunna. On reprend de l'eau pour elles."}, {"ar": {"choices": ["فرض", "سنة"], "question": "غسل اليدين إلى الكوعين عند الشروع", "explanation": "غسل اليدين إلى الكوعين عند الشروع من سنن الوضوء."}, "image": "/assets/quiz/ablution-mains-poignets.svg", "answer": 1, "choices": ["Farata (obligatoire)", "Sunna (recommandée)"], "imageAlt": "Laver les mains jusqu’aux poignets", "question": "Se laver les mains jusqu'aux poignets au début", "explanation": "Se laver les mains jusqu'aux poignets en commençant est une sunna."}, {"ar": {"choices": ["فرض", "سنة"], "question": "الدلك", "explanation": "الدلك من فرائض الوضوء."}, "answer": 0, "choices": ["Farata (obligatoire)", "Sunna (recommandée)"], "question": "Frotter les membres (dalk)", "explanation": "Le dalk est une farata."}, {"ar": {"choices": ["فرض", "سنة"], "question": "الترتيب بين الفرائض", "explanation": "الترتيب بين الفرائض من سنن الوضوء."}, "answer": 1, "choices": ["Farata (obligatoire)", "Sunna (recommandée)"], "question": "Respecter l'ordre des farata", "explanation": "Faire les farata dans l'ordre est une sunna."}, {"ar": {"choices": ["يفعلها ولا يعيد الصلاة", "يعيد كل صلواته", "يعيد الوضوء والصلاة"], "question": "من ترك سنة من سنن الوضوء، ماذا يفعل؟", "explanation": "وإن ترك سنة فعلها ولا يعيد الصلاة."}, "answer": 0, "choices": ["La faire, sans refaire la prière", "Refaire toutes ses prières", "Recommencer les ablutions et la prière"], "question": "On a oublié une sunna des ablutions. Que faire ?", "explanation": "Si on oublie une sunna, on la fait. Pas besoin de refaire la prière."}], "description": "Farata ou sunna ? Ce qui est recommandé dans les ablutions."}, {"ar": {"title": "فرائض الصلاة", "description": "فرائض الصلاة."}, "id": "farata-diouli", "icon": "ph-hands-praying", "title": "Farata diouli", "lesson": {"cards": [{"ar": {"text": "ذكر الأخضري أربع عشرة فريضة في الصلاة، وهي أفعال وأقوال واجبة.", "title": "فرائض الصلاة الأربع عشرة"}, "text": "Al-Akhdari compte quatorze farata dans la prière. Ce sont les gestes et les paroles obligatoires.", "title": "Les quatorze farata"}, {"ar": {"text": "يدخل في الصلاة بتكبيرة الإحرام قائما، وينوي الصلاة عندها.", "title": "النية وتكبيرة الإحرام"}, "text": "On entre en prière par la takbîr d’entrée, debout. On fait l’intention de la prière à ce moment-là.", "image": "/assets/quiz/priere-takbir.svg", "title": "L’intention et le premier « Allahou Akbar »", "imageAlt": "Dire Allahou Akbar, les mains levées"}, {"ar": {"text": "يقرأ الفاتحة وهو قائم.", "title": "الفاتحة والقيام لها"}, "text": "On récite la Fâtiha en restant debout.", "image": "/assets/quiz/priere-debout.svg", "title": "La Fâtiha, debout", "imageAlt": "Debout pendant la récitation"}, {"ar": {"text": "يركع، ثم يرفع منه معتدلا.", "title": "الركوع"}, "text": "On s’incline (roukou’), puis on se redresse bien droit.", "image": "/assets/quiz/priere-roukou.svg", "title": "L’inclinaison : le roukou’", "imageAlt": "S’incliner, les mains sur les genoux"}, {"ar": {"text": "يسجد على جبهته، ثم يرفع منه.", "title": "السجود"}, "text": "On se prosterne, le front posé au sol, puis on se relève.", "image": "/assets/quiz/priere-soujoud.svg", "title": "La prosternation : le soujoud", "imageAlt": "Front posé au sol"}, {"ar": {"text": "يطمئنّ في كل ركن قليلا، ويرتّب الفرائض.", "title": "الطمأنينة"}, "text": "On reste un instant calme dans chaque position : c’est la touma’nîna. Et on fait tout dans l’ordre.", "title": "Le calme dans chaque position"}, {"ar": {"text": "يخرج من الصلاة بالسلام وهو جالس.", "title": "السلام والجلوس له"}, "text": "On sort de la prière par le salam, en étant assis.", "image": "/assets/quiz/priere-salam.svg", "title": "Le salam, assis", "imageAlt": "Tourner la tête pour le salam"}]}, "source": "Mukhtasar d'Al-Akhdari (rite malikite)", "category": "Ablutions et prière", "questions": [{"ar": {"choices": ["أربع عشرة", "سبع", "خمس"], "question": "كم عدد فرائض الصلاة عند الأخضري؟", "explanation": "ذكر الأخضري أربع عشرة فريضة."}, "answer": 0, "choices": ["14", "7", "5"], "question": "Combien y a-t-il de farata dans la prière ?", "explanation": "Al-Akhdari compte quatorze farata dans la prière."}, {"ar": {"choices": ["بتكبيرة الإحرام", "بالسلام", "بالسورة"], "question": "بمَ يدخل المصلي في الصلاة؟", "explanation": "من فرائض الصلاة تكبيرة الإحرام والقيام لها."}, "image": "/assets/quiz/priere-takbir.svg", "answer": 0, "choices": ["La takbîr d'entrée « Allahou Akbar »", "Le salam", "Une sourate"], "imageAlt": "Takbîr d’entrée, mains levées", "question": "Par quoi entre-t-on en prière ?", "explanation": "On entre en prière par la takbîr d'entrée (takbîratoul ihrâm), dite debout."}, {"ar": {"choices": ["مقارنة لتكبيرة الإحرام", "بعد الفاتحة", "في آخر الصلاة"], "question": "متى تكون نية الصلاة؟", "explanation": "وشروط النية مقارنتها لتكبيرة الإحرام."}, "answer": 0, "choices": ["Au moment de la takbîr d'entrée", "Après la Fâtiha", "À la fin de la prière"], "question": "Quand faut-il faire l'intention de la prière ?", "explanation": "On fait l'intention en disant la takbîr d'entrée."}, {"ar": {"choices": ["فرض", "سنة"], "question": "قراءة الفاتحة", "explanation": "الفاتحة والقيام لها من فرائض الصلاة."}, "image": "/assets/quiz/priere-debout.svg", "answer": 0, "choices": ["Farata (obligatoire)", "Sunna (recommandée)"], "imageAlt": "Debout pour réciter la Fâtiha", "question": "Réciter la Fâtiha", "explanation": "Réciter la Fâtiha, debout, est une farata."}, {"ar": {"choices": ["فرض", "سنة"], "question": "الرفع من الركوع", "explanation": "الركوع والرفع منه من فرائض الصلاة."}, "image": "/assets/quiz/priere-roukou.svg", "answer": 0, "choices": ["Farata (obligatoire)", "Sunna (recommandée)"], "imageAlt": "Inclinaison (roukou’)", "question": "Se redresser après l'inclinaison (roukou')", "explanation": "S'incliner (roukou') puis se redresser : ce sont des farata."}, {"ar": {"choices": ["السكون في كل ركن قليلا", "الإسراع في الصلاة", "الجهر بالقراءة"], "question": "ما هي الطمأنينة؟", "explanation": "الطمأنينة من فرائض الصلاة."}, "answer": 0, "choices": ["Marquer un temps de calme dans chaque position", "Prier vite", "Prier à voix haute"], "question": "Que veut dire « touma'nîna » ?", "explanation": "La touma'nîna, c'est rester calme un instant dans chaque position. C'est une farata."}, {"ar": {"choices": ["فرض", "سنة"], "question": "السجود على الجبهة", "explanation": "السجود على الجبهة والرفع منه من فرائض الصلاة."}, "image": "/assets/quiz/priere-soujoud.svg", "answer": 0, "choices": ["Farata (obligatoire)", "Sunna (recommandée)"], "imageAlt": "Prosternation, le front au sol", "question": "Poser le front au sol pendant la prosternation", "explanation": "Poser le front au sol est une farata."}, {"ar": {"choices": ["بالسلام مع الجلوس له", "بالتكبير", "بالقيام"], "question": "بمَ يخرج المصلي من الصلاة؟", "explanation": "السلام وجلوسه الذي يقارنه من فرائض الصلاة."}, "image": "/assets/quiz/priere-salam.svg", "answer": 0, "choices": ["Par le salam, en étant assis", "Par la takbîr", "En se levant"], "imageAlt": "Salam, en position assise", "question": "Comment sort-on de la prière ?", "explanation": "Le salam est une farata, et la position assise pour le dire aussi."}], "description": "Ce qui est obligatoire dans la prière."}, {"ar": {"title": "سنن الصلاة", "description": "فرض أم سنة؟ سنن الصلاة."}, "id": "sunna-diouli", "icon": "ph-mosque", "title": "Sunna diouli", "lesson": {"cards": [{"ar": {"text": "السنن مؤكّدة في الصلاة، فلا تُترك عمدا.", "title": "سنن الصلاة"}, "text": "Les sunna sont fortement recommandées dans la prière. On ne les laisse pas exprès.", "title": "Les sunna de la prière"}, {"ar": {"text": "يقيم قبل الصلاة.", "title": "الإقامة"}, "text": "Avant la prière, on fait l’iqâma.", "title": "L’iqâma"}, {"ar": {"text": "يقرأ بعد الفاتحة سورة وهو قائم.", "title": "السورة بعد الفاتحة"}, "text": "Après la Fâtiha, on récite une autre sourate, debout.", "image": "/assets/quiz/priere-debout.svg", "title": "La sourate après la Fâtiha", "imageAlt": "Debout pendant la récitation"}, {"ar": {"text": "يجهر فيما يُجهر فيه، ويُسرّ فيما يُسرّ فيه.", "title": "الجهر والسرّ"}, "text": "On récite à voix haute dans les prières à voix haute, et à voix basse dans les autres.", "title": "À voix haute ou à voix basse"}, {"ar": {"text": "كل تكبيرة سنّة إلا تكبيرة الإحرام. ويقول عند الرفع من الركوع: سمع الله لمن حمده.", "title": "التكبير والتسميع"}, "text": "Tous les « Allahou Akbar » sont des sunna, sauf le premier. En se relevant du roukou’, on dit « Sami’allâhou liman hamidah ».", "title": "Les autres « Allahou Akbar »"}, {"ar": {"text": "التشهّدان والجلوس لهما سنّة، ومعهما الصلاة على النبي ﷺ.", "title": "التشهّد والجلوس له"}, "text": "Les deux tachahhoud (attahiyyâtou), et la position assise pour les dire, sont des sunna. On y ajoute la prière sur le Prophète (PSL).", "image": "/assets/quiz/priere-assis.svg", "title": "Le tachahhoud, assis", "imageAlt": "Assis pour le tachahhoud"}, {"ar": {"text": "يسجد أيضا على الأنف واليدين والركبتين وأطراف القدمين.", "title": "السجود على الأعضاء"}, "text": "On se prosterne aussi sur le nez, les mains, les genoux et le bout des orteils.", "image": "/assets/quiz/priere-soujoud.svg", "title": "La prosternation complète", "imageAlt": "Prosternation"}]}, "source": "Mukhtasar d'Al-Akhdari (rite malikite)", "category": "Ablutions et prière", "keepOrder": true, "questions": [{"ar": {"choices": ["فرض", "سنة"], "question": "السورة التي بعد الفاتحة", "explanation": "السورة التي بعد الفاتحة من سنن الصلاة."}, "image": "/assets/quiz/priere-debout.svg", "answer": 1, "choices": ["Farata (obligatoire)", "Sunna (recommandée)"], "imageAlt": "Debout pour réciter la sourate", "question": "Réciter une sourate après la Fâtiha", "explanation": "La sourate après la Fâtiha est une sunna."}, {"ar": {"choices": ["فرض", "سنة"], "question": "التكبير بعد تكبيرة الإحرام", "explanation": "كل تكبيرة سنة إلا الأولى."}, "answer": 1, "choices": ["Farata (obligatoire)", "Sunna (recommandée)"], "question": "Les « Allahou Akbar » après celui d'entrée", "explanation": "Toutes les takbîr sont des sunnas, sauf la première."}, {"ar": {"choices": ["فرض", "سنة"], "question": "قول: سمع الله لمن حمده", "explanation": "سمع الله لمن حمده من سنن الصلاة."}, "answer": 1, "choices": ["Farata (obligatoire)", "Sunna (recommandée)"], "question": "Dire « Sami'allâhou liman hamidah »", "explanation": "C'est une sunna."}, {"ar": {"choices": ["فرض", "سنة"], "question": "التشهد", "explanation": "التشهدان والجلوس لهما من سنن الصلاة."}, "image": "/assets/quiz/priere-assis.svg", "answer": 1, "choices": ["Farata (obligatoire)", "Sunna (recommandée)"], "imageAlt": "Assis pour le tachahhoud", "question": "Le tachahhoud (attahiyyâtou)", "explanation": "Les deux tachahhoud, et la position assise pour les dire, sont des sunnas."}, {"ar": {"choices": ["فرض", "سنة"], "question": "تكبيرة الإحرام", "explanation": "تكبيرة الإحرام من فرائض الصلاة."}, "image": "/assets/quiz/priere-takbir.svg", "answer": 0, "choices": ["Farata (obligatoire)", "Sunna (recommandée)"], "imageAlt": "Takbîr d’entrée, mains levées", "question": "La takbîr d'entrée « Allahou Akbar »", "explanation": "La takbîr d'entrée est une farata."}, {"ar": {"choices": ["فرض", "سنة"], "question": "الصلاة على رسول الله ﷺ", "explanation": "الصلاة على رسول الله ﷺ من سنن الصلاة."}, "answer": 1, "choices": ["Farata (obligatoire)", "Sunna (recommandée)"], "question": "La prière sur le Prophète (PSL)", "explanation": "La prière sur le Prophète (PSL) est une sunna."}, {"ar": {"choices": ["فرض", "سنة"], "question": "الإقامة", "explanation": "الإقامة من سنن الصلاة."}, "answer": 1, "choices": ["Farata (obligatoire)", "Sunna (recommandée)"], "question": "L'iqâma avant la prière", "explanation": "L'iqâma est une sunna."}, {"ar": {"choices": ["فرض", "سنة"], "question": "الجهر فيما يجهر فيه", "explanation": "الجهر فيما يجهر فيه من سنن الصلاة."}, "answer": 1, "choices": ["Farata (obligatoire)", "Sunna (recommandée)"], "question": "Réciter à voix haute dans les prières à voix haute", "explanation": "Réciter à voix haute là où c'est prévu est une sunna."}], "description": "Farata ou sunna ? Ce qui est recommandé dans la prière."}, {"id": "notre-dahira", "icon": "ph-users-three", "title": "Notre dahira", "category": "Le dahira", "questions": [{"answer": 0, "choices": ["1999", "2012", "1985"], "question": "En quelle année le dahira a-t-il été fondé ?", "explanation": "Le dahira est né à Yeumbeul en 1999."}, {"answer": 0, "choices": ["Yeumbeul", "Tivaouane", "Saint-Louis"], "question": "Dans quelle localité le dahira est-il né ?", "explanation": "Des fidèles de Yeumbeul ont fondé le dahira en 1999."}, {"answer": 0, "choices": ["Ceux qui s'aiment pour Dieu", "Ceux qui voyagent pour Dieu", "Les gardiens du savoir"], "question": "Que signifie « Moutahabina Fillahi » ?", "explanation": "Moutahabina Fillahi : « ceux qui s'aiment pour Dieu »."}, {"answer": 0, "choices": ["Serigne Mansour Sy « Borom Daaraji »", "Serigne Babacar Sy", "Seydi El Hadji Malick Sy"], "question": "Sous la guidance de qui le dahira a-t-il été fondé ?", "explanation": "Serigne Mansour Sy « Borom Daaraji » guidait le dahira dès sa fondation en 1999.", "choiceImages": ["/assets/tenants/moutahabina/lignee/serigne-mansour-sy.webp", "/assets/tenants/moutahabina/lignee/serigne-babacar-sy.webp", "/assets/tenants/moutahabina/lignee/seydi-el-hadji-malick-sy.webp"]}, {"image": "/assets/tenants/moutahabina/lignee/serigne-mame-malick-sy.webp", "answer": 0, "choices": ["2012", "1999", "2020"], "imageAlt": "Portrait de Serigne Mame Malick Sy", "question": "Depuis quelle année Serigne Mame Malick Sy guide-t-il le dahira ?", "explanation": "Après le rappel à Dieu de Serigne Mansour Sy en 2012, son fils Serigne Mame Malick Sy guide le dahira."}, {"answer": 0, "choices": ["S'aimer pour Dieu, servir ensemble.", "Apprendre avant de parler.", "Le travail avant tout."], "question": "Quelle est la devise du dahira ?", "explanation": "« S'aimer pour Dieu, servir ensemble » : c'est le sens même de Moutahabina Fillahi."}], "description": "Son histoire, son nom et son guide."}, {"id": "lignee-de-tivaouane", "icon": "ph-book-open-text", "title": "La lignée de Tivaouane", "category": "Le dahira", "questions": [{"image": "/assets/tenants/moutahabina/lignee/seydi-el-hadji-malick-sy.webp", "answer": 0, "choices": ["Maodo", "Borom Daaraji", "Borom bonnet carré"], "imageAlt": "Portrait de Seydi El Hadji Malick Sy", "question": "Quel surnom donne-t-on à Seydi El Hadji Malick Sy ?", "explanation": "Seydi El Hadji Malick Sy est appelé « Maodo »."}, {"answer": 0, "choices": ["Tivaouane", "Kaolack", "Ziguinchor"], "question": "Dans quelle ville Seydi El Hadji Malick Sy a-t-il fondé sa grande école ?", "explanation": "À Tivaouane, il fonde la zawiya et une grande école. Beaucoup de muqaddams y ont été formés."}, {"answer": 0, "choices": ["1922", "1957", "1902"], "question": "En quelle année Seydi El Hadji Malick Sy est-il rappelé à Dieu ?", "explanation": "Il est rappelé à Dieu le 27 juin 1922."}, {"answer": 0, "choices": ["Serigne Babacar Sy", "Serigne Mansour Sy", "Serigne Mame Malick Sy"], "question": "Qui fut le premier Khalife général des Tidianes ?", "explanation": "Serigne Babacar Sy devient le premier Khalife général des Tidianes en 1922, à 37 ans.", "choiceImages": ["/assets/tenants/moutahabina/lignee/serigne-babacar-sy.webp", "/assets/tenants/moutahabina/lignee/serigne-mansour-sy.webp", "/assets/tenants/moutahabina/lignee/serigne-mame-malick-sy.webp"]}, {"image": "/assets/tenants/moutahabina/lignee/serigne-babacar-sy.webp", "answer": 0, "choices": ["Borom bonnet carré", "Maodo", "Borom Daaraji"], "imageAlt": "Portrait de Serigne Babacar Sy", "question": "Quel surnom porte Serigne Babacar Sy ?", "explanation": "Serigne Babacar Sy est appelé « Borom bonnet carré »."}, {"answer": 0, "choices": ["Il a initié les premiers dahiras", "Il a interdit les dahiras", "Aucun rôle particulier"], "question": "Quel rôle Serigne Babacar Sy a-t-il joué pour les dahiras ?", "explanation": "Il a lancé les premiers dahiras, comme la Dahiratoul Kiram, pour s'entraider et apprendre ensemble."}, {"image": "/assets/tenants/moutahabina/lignee/serigne-mansour-sy.webp", "answer": 0, "choices": ["Il a dirigé le grand daara fondé par son grand-père", "C'est le nom de son village natal", "C'est le nom de son premier livre"], "imageAlt": "Portrait de Serigne Mansour Sy", "question": "Pourquoi Serigne Mansour Sy est-il appelé « Borom Daaraji » ?", "explanation": "Pendant de longues années, il a dirigé le grand daara de Tivaouane fondé par Maodo."}, {"answer": 0, "choices": ["Serigne Mansour Sy", "Serigne Babacar Sy", "Seydi El Hadji Malick Sy"], "question": "Qui est le père de notre guide, Serigne Mame Malick Sy ?", "explanation": "Serigne Mame Malick Sy est le fils de Serigne Mansour Sy « Borom Daaraji ».", "choiceImages": ["/assets/tenants/moutahabina/lignee/serigne-mansour-sy.webp", "/assets/tenants/moutahabina/lignee/serigne-babacar-sy.webp", "/assets/tenants/moutahabina/lignee/seydi-el-hadji-malick-sy.webp"]}], "description": "Quatre générations au service du savoir."}, {"id": "notre-charte", "icon": "ph-scroll", "title": "Notre charte", "category": "Le dahira", "questions": [{"answer": 0, "choices": ["La tenue blanche (ou une tenue correcte)", "Une tenue verte", "Aucune tenue particulière"], "question": "Quelle tenue est obligatoire au dahira ?", "explanation": "La charte demande une tenue blanche, ou à défaut une tenue correcte."}, {"answer": 0, "choices": ["20 h 30", "20 h 00", "22 h 10"], "question": "À quelle heure commence le dahira ?", "explanation": "Le dahira commence à 20 h 30 et se termine à 23 h 00."}, {"answer": 0, "choices": ["L'Oustaz", "Les nabiens", "Les informations"], "question": "Que se passe-t-il de 22 h 10 à 22 h 50 ?", "explanation": "Nabiens de 20 h 30 à 22 h 10, puis l’Oustaz de 22 h 10 à 22 h 50, et les informations à 22 h 50."}, {"answer": 0, "choices": ["1 000 F CFA", "2 000 F CFA", "4 000 F CFA"], "question": "Combien chaque membre cotise-t-il pour un baptême ou un mariage ?", "explanation": "Pour un baptême ou un mariage, chaque membre cotise 1 000 F CFA."}, {"answer": 0, "choices": ["4 000 F CFA", "1 000 F CFA", "2 000 F CFA"], "question": "Combien un membre donne-t-il le jour où il reçoit le dahira ?", "explanation": "4 000 F CFA : 2 000 pour la sonorisation et 2 000 pour le thé (ataya)."}, {"answer": 0, "choices": ["La discipline", "La présence", "La tenue correcte"], "question": "Que veut dire « Yar ak téguine » ?", "explanation": "« Yar ak téguine » : la discipline, l'un des engagements de la charte."}, {"answer": 0, "choices": ["La présence physique et financière", "La discipline", "La carte de membre"], "question": "À quoi correspond « Téw tay téwal » ?", "explanation": "« Téw tay téwal » : être présent, physiquement et financièrement."}], "description": "Les engagements des membres et le déroulement d'un dahira."}]}$ancien$::jsonb;

-- Vérification : 10 quiz, tous en arabe
select
  jsonb_array_length(quiz -> 'themes') as quiz,
  (select count(*) from jsonb_array_elements(quiz -> 'themes') t
     where t ? 'ar'
       and not exists (select 1 from jsonb_array_elements(t -> 'questions') q where not (q ? 'ar'))) as quiz_en_arabe
from public.sites
where adresse = 'moutahabina';

commit;
