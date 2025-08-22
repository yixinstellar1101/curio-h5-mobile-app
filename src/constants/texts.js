export const texts = {
  // HomePage
  homePage: {
    upload: {
      zh: '上传图片',
      en: 'Upload an Image'
    },
    time: {
      zh: '12:15',
      en: '12:15'
    }
  },

  // ImageUploadPage
  imageUpload: {
    fromAlbum: {
      zh: '从相册选择',
      en: 'Choose from Album'
    },
    camera: {
      zh: '相机',
      en: 'Camera'
    },
    cancel: {
      zh: '取消',
      en: 'Cancel'
    },
    processing: {
      zh: '处理中...',
      en: 'Processing...'
    },
    fileSizeError: {
      zh: '文件大小超过5MB限制',
      en: 'File size exceeds 5MB limit'
    },
    fileFormatError: {
      zh: '请选择有效的图片文件 (JPEG, PNG, GIF)',
      en: 'Please select a valid image file (JPEG, PNG, GIF)'
    }
  },

  // ImageAnalysisPage
  imageAnalysis: {
    analyzing: {
      zh: '正在分析图片...',
      en: 'Analyzing picture...'
    },
    chooseAgain: {
      zh: '重新选择',
      en: 'Choose Again'
    },
    retake: {
      zh: '重拍',
      en: 'Retake'
    },
    continueToGallery: {
      zh: '进入展间',
      en: 'Continue to Gallery'
    },
    retry: {
      zh: '重试',
      en: 'Retry'
    },
    analysisFailed: {
      zh: '分析失败',
      en: 'Analysis Failed'
    },
    uploadFailedError: {
      zh: '上传失败，请检查网络连接后重试。',
      en: 'Upload failed. Please check your network connection and try again.'
    },
    classificationFailedError: {
      zh: '图片分类失败，请重试。',
      en: 'Image classification failed. Please try again.'
    }
  },

  // GalleryPage
  galleryPage: {
    title: {
      zh: '展间',
      en: 'Gallery'
    },
    emptyState: {
      zh: '暂无展间物品',
      en: 'No Gallery Items'
    },
    emptyStateDesc: {
      zh: '拍照或上传图片开始构建您的展间。',
      en: 'Take a photo or upload an image to start building your gallery.'
    },
    backToHome: {
      zh: '返回首页',
      en: 'Back to Home'
    },
    processing: {
      zh: '处理中...',
      en: 'Processing...'
    },
    enterLiveRoom: {
      zh: '进入直播间',
      en: 'Enter Live Room'
    },
    enterLiveRoomDesc: {
      zh: '您想进入直播间并开始关于这张图片的对话吗？',
      en: 'Would you like to enter the live room and start a conversation about this image?'
    },
    cancel: {
      zh: '取消',
      en: 'Cancel'
    },
    enter: {
      zh: '进入',
      en: 'Enter'
    },
    noDescription: {
      zh: '暂无描述信息。',
      en: 'No description available.'
    },
    modalTitle: {
      zh: '进入直播间',
      en: 'Enter Live Room'
    },
    modalDesc: {
      zh: '您想进入直播间并开始关于这张图片的对话吗？',
      en: 'Would you like to enter the live room and start a conversation about this image?'
    }
  },

  // LiveRoomPage
  liveRoom: {
    title: {
      zh: '直播间',
      en: 'Live Discussion'
    },
    pressAndHold: {
      zh: '按住说话',
      en: 'Press and hold to speak'
    },
    characters: {
      'lu-xun': {
        zh: '鲁迅',
        en: 'Lu Xun'
      },
      'su-shi': {
        zh: '苏轼',
        en: 'Su Shi'
      },
      'vincent-van-gogh': {
        zh: '文森特·梵高',
        en: 'Vincent van Gogh'
      },
      'You': {
        zh: '您',
        en: 'You'
      },
      unknown: {
        zh: '未知角色',
        en: 'Unknown Character'
      }
    },
    characterIntros: {
      'lu-xun': {
        zh: {
          name: '鲁迅',
          quote: '"笔墨如手术刀，可以剖开社会皮肤下的病灶。"',
          tags: '#犀利讽刺家 #现代中国文学 #社会批评家',
          identity: '现代中国文学先驱，以尖锐的社会评论和改革精神闻名。',
          artisticTraits: '简洁有力、富含比喻的散文，语调充满讽刺与同情。',
          perspective: '批判进步主义者；致力于通过文学唤醒社会，相信文化具有改变思想的力量。',
          works: '《阿Q正传》、《狂人日记》、《孔乙己》、《药》，以及众多社会改革散文。',
          background: '生活在中国从帝制向共和制转变的时期（1881-1936），积极倡导现代化与启蒙运动。',
          identityLabel: '身份',
          artisticTraitsLabel: '艺术特征',
          perspectiveLabel: '观点',
          worksLabel: '代表作品',
          backgroundLabel: '历史背景'
        },
        en: {
          name: 'Lu Xun',
          quote: '"The pen is a surgeon\'s scalpel, capable of cutting through the skin to expose the disease beneath society."',
          tags: '#Sharp Satirist #Modern Chinese Literature #Social Critic',
          identity: 'Pioneer of modern Chinese literature, known for sharp social commentary and reformist spirit.',
          artisticTraits: 'Concise yet powerful prose filled with metaphors, tone infused with irony and compassion.',
          perspective: 'Critical progressive; dedicated to awakening society through literature, believing in culture\'s power to change minds.',
          works: '"The True Story of Ah Q", "A Madman\'s Diary", "Kong Yiji", "Medicine", and numerous social reform essays.',
          background: 'Lived during China\'s transition from imperial to republican system (1881-1936), actively advocating modernization and enlightenment.',
          identityLabel: 'Identity',
          artisticTraitsLabel: 'Artistic Traits',
          perspectiveLabel: 'Perspective',
          worksLabel: 'Representative Works',
          backgroundLabel: 'Historical Background'
        }
      },
      'su-shi': {
        zh: {
          name: '苏轼',
          quote: '"月光洒在这件文物上，定能激发出如窗外江水般流淌的诗句。"',
          tags: '#宋朝诗人 #书法家 #自由精神',
          identity: '北宋时期的大诗人和书法家，以多才多艺和自由洒脱的风格闻名。',
          artisticTraits: '抒情哲理并重，将个人情感与自然意象完美融合。',
          perspective: '浪漫主义与反思精神兼具；欣赏艺术工艺之美，重视文化传承的延续性。',
          works: '《念奴娇·赤壁怀古》、《水调歌头》、《卜算子》，以及无数咏叹自然与人情的诗词。',
          background: '生活在北宋时期（1037-1101），曾任多种官职，被誉为中国文学史上最伟大的诗人之一。',
          identityLabel: '身份',
          artisticTraitsLabel: '艺术特征',
          perspectiveLabel: '观点',
          worksLabel: '代表作品',
          backgroundLabel: '历史背景'
        },
        en: {
          name: 'Su Shi',
          quote: '"Moonlight upon this artifact surely inspires verses that flow like the river beyond the window."',
          tags: '#Song Dynasty Poet #Calligrapher #Free Spirit',
          identity: 'Great poet and calligrapher of the Northern Song Dynasty, renowned for versatility and free-spirited style.',
          artisticTraits: 'Balances lyricism with philosophy, perfectly merging personal emotions with natural imagery.',
          perspective: 'Combines romanticism with reflective spirit; appreciates artistic craftsmanship and values cultural continuity.',
          works: '"Remembering Red Cliff", "Prelude to Water Melody", "The Diviner", and countless poems celebrating nature and humanity.',
          background: 'Lived during the Northern Song period (1037-1101), served in various official positions, hailed as one of China\'s greatest poets.',
          identityLabel: 'Identity',
          artisticTraitsLabel: 'Artistic Traits',
          perspectiveLabel: 'Perspective',
          worksLabel: 'Representative Works',
          backgroundLabel: 'Historical Background'
        }
      },
      'vincent-van-gogh': {
        zh: {
          name: '文森特·梵高',
          quote: '"我画的不是我所见到的，而是在那个疯狂夜晚我所感受到的。"',
          tags: '#孤独天才 #后印象派 #内心夜空',
          identity: '19世纪荷兰画家，《星夜》的创作者。',
          artisticTraits: '经常引用个人书信；对色彩的情感力量极其敏感。',
          perspective: '通过自我治愈的视角，诠释旋转的星空、柏树和梦幻般的村庄。',
          works: '《星夜》、《向日葵》、《吃土豆的人》、《夜间咖啡馆》、《包扎耳朵的自画像》。',
          background: '生活在后印象派时期（1853-1890），与心理疾病抗争，在生命的最后几年创作了大部分杰作。',
          identityLabel: '身份',
          artisticTraitsLabel: '艺术特征',
          perspectiveLabel: '观点',
          worksLabel: '代表作品',
          backgroundLabel: '历史背景'
        },
        en: {
          name: 'Vincent van Gogh',
          quote: '"I paint not what I see, but what I felt during that mad night."',
          tags: '#Lonely Genius #Post-Impressionist #Inner Night Sky',
          identity: '19th-century Dutch painter, creator of "The Starry Night".',
          artisticTraits: 'Often references personal letters; extremely sensitive to the emotional power of color.',
          perspective: 'Interprets swirling starscapes, cypress trees, and dreamlike villages through a lens of self-healing.',
          works: '"The Starry Night", "Sunflowers", "The Potato Eaters", "The Night Café", "Self-Portrait with Bandaged Ear".',
          background: 'Lived during the Post-Impressionist period (1853-1890), struggled with mental illness, created most masterpieces in his final years.',
          identityLabel: 'Identity',
          artisticTraitsLabel: 'Artistic Traits',
          perspectiveLabel: 'Perspective',
          worksLabel: 'Representative Works',
          backgroundLabel: 'Historical Background'
        }
      }
    }
  },

  // TextInputPage
  textInput: {
    placeholder: {
      zh: '输入您的消息...',
      en: 'Type your message...'
    },
    character: {
      zh: '角色',
      en: 'Character'
    },
    send: {
      zh: '发送',
      en: 'Send'
    }
  },

  // Language Selection Modal
  languageModal: {
    title: {
      zh: '选择语言',
      en: 'Select Language'
    },
    chinese: {
      zh: '中文',
      en: '中文'
    },
    english: {
      zh: 'English',
      en: 'English'
    },
    confirm: {
      zh: '确认',
      en: 'Confirm'
    },
    cancel: {
      zh: '取消',
      en: 'Cancel'
    }
  },

  // Character names
  characters: {
    luxun: {
      zh: '鲁迅',
      en: 'Lu Xun'
    },
    sushi: {
      zh: '苏轼',
      en: 'Su Shi'
    },
    vangogh: {
      zh: '文森特·梵高',
      en: 'Vincent van Gogh'
    },
    unknown: {
      zh: '未知角色',
      en: 'Unknown'
    }
  }
};
