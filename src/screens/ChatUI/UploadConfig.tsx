import React, {FC, useState, useEffect} from 'react';
import {StyleSheet, View} from 'react-native';
import Screen from '../../components/Screen';
import {File as _File} from './MessageFiles';
import {MessageAttachement} from '../../models';
import withTheme from '../../contexts/theme/withTheme';
import Composer from './Composer';
import px from '../../utils/normalizePixel';
import FastImage from 'react-native-fast-image';
import {Platform} from '../../utils/platform';
import UploadDropZoneWeb from './UploadDropZoneWeb';
import EmojiButton from './EmojiButton';
import {EmojiData} from 'emoji-mart';

interface NativeFile {
  uri: string;
}

interface Props {
  files: File[];
}

interface UploadFile {
  uri: string;
  origin: File;
}

const UploadConfig: FC<Props> = ({files}) => {
  const [caption, setCaption] = useState('');
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);

  useEffect(() => {
    (async () => {
      setUploadFiles(await normalizeFiles(files));
    })();
  }, []);

  const normalizeFiles = async (files: File[]): Promise<UploadFile[]> => {
    const temp: UploadFile[] = [];
    for (let file of files) {
      let uri = file.path;
      if (Platform.isWeb && file.type.startsWith('image')) {
        uri = await convertFileToDataURI(file);
      }
      temp.push({uri, origin: file});
    }
    return temp;
  };

  const convertFileToDataURI = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      try {
        const fr = new FileReader();
        fr.onload = function() {
          resolve(fr.result as string);
        };
        fr.readAsDataURL(file);
      } catch (err) {
        reject(err);
      }
    });

  const handleFileDropWeb = async (files: File[]) => {
    setUploadFiles([...uploadFiles, ...(await normalizeFiles(files))]);
  };

  const handleEmojiSelected = (emoji: EmojiData) => setCaption(caption + emoji.native);

  const renderFile = (file: UploadFile) => {
    if (file.origin.type.startsWith('image')) return renderImage(file.uri);

    const File = withTheme(_File);
    const _messageFile: MessageAttachement = {
      name: file.origin.name,
      url_private_download: file.origin.path,
      mimetype: file.origin.type,
      filetype: file.origin.type,
      size: file.origin.size,
    };

    return <File file={_messageFile} />;
  };

  const renderImage = (uri: string) => {
    //console.log('image__', uri);
    return <FastImage source={{uri}} style={{width: '95%', height: px(200)}} />;
  };

  const renderComposer = () => {
    return (
      <View style={{height: px(150), flexDirection: 'row'}}>
        <Composer text={caption} onTextChanged={setCaption} />
        <EmojiButton onEmojiSelected={handleEmojiSelected} />
      </View>
    );
  };

  return (
    <UploadDropZoneWeb onDrop={handleFileDropWeb}>
      <Screen style={styles.container}>
        {uploadFiles.map(renderFile)}
        {renderComposer()}
      </Screen>
    </UploadDropZoneWeb>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: px(15),
  },
});

export default UploadConfig;