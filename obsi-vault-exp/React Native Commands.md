tags: #reactnative #info 

npx react-native start
npx react-native run-android
npx @react-native-community/cli init ProjectName
npm install lib
adb logcat "*:S" ReactNativeJS:V


# Hard Reset
- ```
    cd android
    ./gradlew clean
    ```
    
    (Windows `gradlew.bat clean`)
    
- **Clear Metro Bundler Cache:** In React Native, Metro's own cache can also cause problems. This command clears the Metro cache.
    
    Bash
    
    ```
    npm start -- --reset-cache
    ```
    
- **Clear Loader Caches and Temporary Files:** This is the most aggressive cleaning method. It deletes `node_modules` and lock files, then reinstalls all dependencies.
    
    Bash
    
    ```
    rm -rf node_modules
    rm -rf package-lock.json
    npm install
    ```
    
    (You may need to use commands like `del /s /q node_modules` in Windows)
    
- **Clear Native Build Caches:** To clear Android Gradle's build caches, it may also be helpful to delete directories such as `build`, `.gradle`, and `app/build` within the Android folder.
    
    Bash
    
    ```
    cd android
    rm -rf build .gradle app/build
    cd ..
    ```

