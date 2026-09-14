/* eslint-disable @typescript-eslint/no-require-imports */
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, StyleSheet, TouchableOpacity, View } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import api from '../../../infrastructure/api/api-config/api';
import { useAppTheme } from '../../../shared/providers/AppThemeProvider';
import { UploadableFile } from '../../../features/user/services/media.service';
import { useProfilePicture } from '../../../shared/hooks/use-profile-picture.hook';

type ImagePickerComponentProps = {
  openActionSheet: () => void;
  closeActionSheet: () => void;
  triggerImgPicker: boolean;
  triggerRemoveImg: boolean;
  triggerViewImg?: boolean;
  userId: string;
  gender: string;
  profilePicPath: string | null;
  isUploadingProfilePicture: boolean;
  uploadProfilePicture: (file: UploadableFile) => Promise<unknown>;
  refreshUser: () => Promise<void>;
  setTriggerImgPicker: React.Dispatch<React.SetStateAction<boolean>>;
  setTriggerRemoveImg: React.Dispatch<React.SetStateAction<boolean>>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  style: any;
};

function ImagePickerComponent({
  openActionSheet,
  closeActionSheet,
  triggerImgPicker,
  setTriggerImgPicker,
  triggerRemoveImg,
  triggerViewImg = false,
  userId,
  gender,
  profilePicPath,
  isUploadingProfilePicture,
  uploadProfilePicture,
  refreshUser,
  setTriggerRemoveImg,
  style,
}: ImagePickerComponentProps) {
  const { colors: theme } = useAppTheme();
  const [viewerOpen, setViewerOpen] = useState(false);

  const profilePictureUrl = useProfilePicture(profilePicPath);
  const imageSource = profilePictureUrl
    ? { uri: profilePictureUrl }
    : gender === 'Female'
      ? require('../../../assets/woman.png')
      : require('../../../assets/man.png');

  const pickAndUploadImage = async () => {
    await ImagePicker.requestMediaLibraryPermissionsAsync();

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.5,
    });

    if (!result.canceled && result.assets.length > 0) {
      const asset = result.assets[0];

      const file = {
        uri: asset.uri,
        name: `${userId}.jpg`,
        type: 'image/jpeg',
      };

      await uploadProfilePicture(file);
    }
  };

  const deleteProfilePicture = async () => {
    await api.delete(`/api/users/me/profile-picture`, {
      data: { path: profilePicPath },
    });

    await refreshUser();
  };

  useEffect(() => {
    closeActionSheet();
    if (triggerImgPicker) pickAndUploadImage();
    setTriggerImgPicker(false);
  }, [triggerImgPicker]);

  useEffect(() => {
    closeActionSheet();
    if (triggerRemoveImg) deleteProfilePicture();
    setTriggerRemoveImg(false);
  }, [triggerRemoveImg]);

  useEffect(() => {
    if (triggerViewImg) {
      closeActionSheet();
      setViewerOpen(true);
    }
  }, [triggerViewImg]);

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={openActionSheet} accessibilityLabel="Manage profile photo">
        {isUploadingProfilePicture ? (
          <ActivityIndicator size="large" />
        ) : (
          <Image
            source={imageSource}
            cachePolicy="memory-disk"
            contentFit="cover"
            style={[styles.image, style]}
          />
        )}
      </TouchableOpacity>

      <View style={[styles.cameraIconContainer, { backgroundColor: theme.primary, borderColor: theme.canvas }]} pointerEvents="none">
        <MaterialCommunityIcons name="camera" color={theme.white} size={RFValue(14)} />
      </View>
      <Modal visible={viewerOpen} transparent animationType="fade" onRequestClose={() => setViewerOpen(false)}>
        <Pressable style={styles.viewerBackdrop} onPress={() => setViewerOpen(false)} accessibilityLabel="Close profile photo">
          <Image source={imageSource} cachePolicy="memory-disk" contentFit="contain" style={styles.viewerImage} />
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center' },
  image: {
    borderRadius: 999,
  },
  cameraIconContainer: {
    position: 'absolute',
    bottom: 2,
    right: 0,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    borderWidth: 3,
  },
  viewerBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  viewerImage: { width: '100%', aspectRatio: 1, borderRadius: 20 },
});

export default ImagePickerComponent;
