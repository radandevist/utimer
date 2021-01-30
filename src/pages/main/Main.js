/* eslint-disable react-native/no-inline-styles */
//todo
//6- about page
//8-remember last color theme and mode. (use asynctorage)
//Good luck

import React, {Component} from 'react';
import {View, Text, StyleSheet, StatusBar, ToastAndroid} from 'react-native';
import {Container, Content, Button, Icon, Radio} from 'native-base';
import RBSheet from 'react-native-raw-bottom-sheet';
import ProgressRing from '../../components/ProgressRing';
import {WheelPicker} from 'react-native-wheel-picker-android';
import themes from '../../themes/themes';
import PopupMenu from '../../components/PopupMenu';

const createArray = length => {
  const arr = [];
  let i = 0;
  while (i < length) {
    arr.push(i.toString());
    i += 1;
  }
  return arr;
};

const AVAILABLE_HOURS = createArray(24);
const AVAILABLE_MINUTES = createArray(60);
const AVAILABLE_SECONDS = createArray(60);

// 3 => 03, 10 => 10
const formatNumber = number => `0${number}`.slice(-2);

//parameter time is in second
const getRemaining = time => {
  const hours = Math.floor(time / 3600);
  const minutes = Math.floor((time - hours * 3600) / 60);
  const seconds = Math.floor(time - (minutes * 60 + hours * 3600));
  return {
    hours: formatNumber(hours),
    minutes: formatNumber(minutes),
    seconds: formatNumber(seconds),
  };
};

const formatTime = (hour, min, sec) => {
  return parseInt(hour, 10) * 3600 + parseInt(min, 10) * 60 + parseInt(sec, 10);
};

export default class Main extends Component {
  constructor(props) {
    super(props);
    this.state = {
      disableSetTime: false,
      base: 0,
      remainingSeconds: 0,
      isRunning: false,
      hasChanged: false,
      selectedHours: '0',
      selectedMinutes: '0',
      selectedSeconds: '0',
      progress: 0,
      // ======
      theme: {
        isNightMode: false,
        mode: themes.mode.day,
        color: themes.color.purple,
      },
    };
    this.interval = null;
  }

  onChangeHours = value => {
    this.setState({
      selectedHours: value,
      hasChanged: true,
    });
  };

  onChangeMinutes = value => {
    this.setState({
      selectedMinutes: value,
      hasChanged: true,
    });
  };

  onChangeSeconds = value => {
    this.setState({
      selectedSeconds: value,
      hasChanged: true,
    });
  };

  componentWillUnmount() {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }

  reset = () => {
    this.setState({
      // base: 0,??
      remainingSeconds: 0,
      progress: 0,
      disableSetTime: false,
    });
  };

  start = () => {
    if (this.state.remainingSeconds === 0) {
      ToastAndroid.showWithGravity(
        'No time fixed',
        ToastAndroid.SHORT,
        ToastAndroid.CENTER,
      );
    } else {
      this.setState({
        disableSetTime: true,
      });
      if (this.state.remainingSeconds !== this.state.base) {
        // pour continuer après une pause
        if (this.state.hasChanged) {
          this.setState({
            isRunning: true,
            hasChanged: false,
          });
        } else {
          this.setState({
            isRunning: true,
          });
        }
      } else {
        //pour commencer un nouveau compte
        this.arcStep = 100 / this.state.base;
        const base = formatTime(
          this.state.selectedHours,
          this.state.selectedMinutes,
          this.state.selectedSeconds,
        );
        this.setState({
          base: base,
          remainingSeconds: base,
          isRunning: true,
          progress: 0,
        });
      }

      this.interval = setInterval(() => {
        this.setState({
          remainingSeconds: this.state.remainingSeconds - 1,
          progress: this.state.progress + this.arcStep,
        });
      }, 1000);
    }
  };

  setBase = () => {
    let base = formatTime(
      this.state.selectedHours,
      this.state.selectedMinutes,
      this.state.selectedSeconds,
    );
    this.setState({
      base: base,
      remainingSeconds: base,
    });
  };

  componentDidUpdate(prevProp, prevState) {
    if (this.state.remainingSeconds === 0 && prevState.remainingSeconds !== 0) {
      this.stop();
    }
    if (
      this.state.selectedHours !== prevState.selectedHours ||
      this.state.selectedMinutes !== prevState.selectedMinutes ||
      this.state.selectedSeconds !== prevState.selectedSeconds
    ) {
      this.setBase();
    }
  }

  stop = () => {
    clearInterval(this.interval);
    this.interval = null;
    this.setState({
      remainingSeconds: this.state.remainingSeconds,
      isRunning: false,
    });
  };

  onChangeMode = () => {
    if (this.state.theme.isNightMode) {
      this.setState({
        theme: {
          isNightMode: false,
          mode: themes.mode.day,
          color: this.state.theme.color,
        },
      });
    } else {
      this.setState({
        theme: {
          isNightMode: true,
          mode: themes.mode.night,
          color: this.state.theme.color,
        },
      });
    }
  };

  onChangeColorTheme = () => {
    // alert('not yet done');
    this.RBSheet2.open();
  };

  onPopupEvent = (eventName, index) => {
    if (eventName !== 'itemSelected') return
    if (index === 0) this.onChangeMode();
    else this.onChangeColorTheme();
  };

  render() {
    const {hours, minutes, seconds} = getRemaining(this.state.remainingSeconds);
    return (
      <Container>
        <StatusBar backgroundColor={this.state.theme.color} />
        <Content
          contentContainerStyle={{alignItems: 'center'}}
          style={{backgroundColor: this.state.theme.mode.bg}}>
          <View style={styles.topView}>
            <PopupMenu
              color={this.state.theme.mode.color}
              style={styles.moreBtn}
              actions={[
                this.state.theme.isNightMode ? 'Day mode' : 'Night mode',
                'Color theme',
              ]}
              onPress={this.onPopupEvent}
            />
          </View>
          <View>
            <View
              style={[
                styles.coloredCircle,
                {
                  borderColor: this.state.theme.color,
                  borderWidth: 4,
                  width: 272,
                  height: 272,
                },
              ]}>
              <ProgressRing
                style={{}}// est ce nécéssaire?
                radius={154}
                stroke={16}
                progress={this.state.progress}
                // progress={100}
                color={this.state.theme.color}
              />
            </View>
          </View>
          <View>
            <Text
              style={{
                color: this.state.theme.mode.color,
                fontSize: 48,
              }}>{`${hours}:${minutes}:${seconds}`}</Text>
          </View>
          <View style={styles.bottomView}>
            {!this.state.isRunning && (
              <Button
                disabled={this.state.disableSetTime ? true : false}
                onPress={() => this.RBSheet.open()}
                style={[
                  styles.ctrlBtn,
                  {
                    backgroundColor: this.state.disableSetTime
                      ? 'grey'
                      : this.state.theme.color,
                  },
                ]}>
                {/* <Text>Set Time</Text> */}
                <Icon
                  style={styles.ctrlBtnIcon}
                  name="timelapse"
                  type="MaterialCommunityIcons"
                />
              </Button>
            )}
            {this.state.isRunning ? (
              <Button
                onPress={() => this.stop()}
                style={[
                  styles.ctrlBtn,
                  {backgroundColor: this.state.theme.color},
                ]}>
                {/* <Text>stop</Text> */}
                <Icon
                  style={styles.ctrlBtnIcon}
                  name="pause"
                  type="MaterialCommunityIcons"
                />
              </Button>
            ) : (
              <Button
                onPress={() => this.start()}
                style={[
                  styles.ctrlBtn,
                  {backgroundColor: this.state.theme.color},
                ]}>
                {/* <Text>Start</Text> */}
                <Icon
                  style={styles.ctrlBtnIcon}
                  name="play"
                  type="MaterialCommunityIcons"
                />
              </Button>
            )}
            {!this.state.isRunning && (
              <Button
                onPress={() => this.reset()}
                style={[
                  styles.ctrlBtn,
                  {backgroundColor: this.state.theme.color},
                ]}>
                {/* <Text>Reset</Text> */}
                <Icon
                  style={styles.ctrlBtnIcon}
                  name="restart"
                  type="MaterialCommunityIcons"
                />
              </Button>
            )}
          </View>
        </Content>
        <RBSheet
          ref={ref => {
            this.RBSheet = ref;
          }}
          height={150}
          duration={300}
          customStyles={{
            container: {
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: this.state.theme.mode.bg,
            },
          }}>
          {this.renderTimePickers()}
        </RBSheet>
        <RBSheet
          ref={ref => {
            this.RBSheet2 = ref;
          }}
          height={150}
          duration={275}
          customStyles={{
            container: {
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: this.state.theme.mode.bg,
            },
          }}>
          <View style={[styles.pickerContainer, styles.colorPickerContainer]}>
            {Object.keys(themes.color).map(key => (
              <Radio
                style={styles.radioColor}
                size={40}
                color={themes.color[key]}
                selectedColor={themes.color[key]}
                onPress={() => {
                  this.setState({
                    theme: {
                      isNightMode: this.state.theme.isNightMode,
                      color: themes.color[key],
                      mode: this.state.theme.mode,
                    },
                  });
                }}
                selected={
                  this.state.theme.color === themes.color[key] ? true : false
                }
              />
            ))}
          </View>
        </RBSheet>
      </Container>
    );
  }

  renderTimePickers = () => {
    return (// return <View>{colorsRadio}</View>;
      <View style={styles.pickerContainer}>
        <View>
          <WheelPicker
            itemTextSize={18}
            selectedItemTextColor={this.state.theme.mode.color}
            selectedItemTextSize={22}
            indicatorColor={this.state.theme.mode.color}
            indicatorWidth={6}
            selectedItem={Number.parseInt(this.state.selectedHours, 10)}
            data={AVAILABLE_HOURS}
            onItemSelected={value => this.onChangeHours(value.toString())}
            isCyclic={true}
          />
        </View>
        <Text style={{color: this.state.theme.mode.color, fontSize: 22}}> : </Text>
        <View>
          <WheelPicker
            itemTextSize={18}
            selectedItemTextColor={this.state.theme.mode.color}
            selectedItemTextSize={22}
            indicatorColor={this.state.theme.mode.color}
            indicatorWidth={6}
            selectedItem={Number.parseInt(this.state.selectedMinutes, 10)}
            data={AVAILABLE_MINUTES}
            onItemSelected={value => this.onChangeMinutes(value.toString())}
            isCyclic={true}
          />
        </View>
        <Text style={{color: this.state.theme.mode.color, fontSize: 22}}> : </Text>
        <View>
          <WheelPicker
            itemTextSize={18}
            itemTextColor={this.state.theme.color}
            selectedItemTextColor={this.state.theme.color}
            selectedItemTextSize={22}
            indicatorColor={this.state.theme.color}
            indicatorWidth={6}
            selectedItem={Number.parseInt(this.state.selectedSeconds, 10)}
            data={AVAILABLE_SECONDS}
            onItemSelected={value => this.onChangeSeconds(value.toString())}
            isCyclic={true}
          />
        </View>
      </View>
    );
  };
}
//end of class

const styles = StyleSheet.create({
  topView: {
    width: '100%',
    height: 50,
    alignItems: 'flex-end',
    // marginTop: 12,
  },
  moreBtn: {
    marginTop: 8,
    marginRight: 4,
  },
  bottomView: {
    width: 300,
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 106,
    paddingBottom: 20,
  },
  ctrlBtn: {
    width: 54,
    height: 54,
    borderRadius: 2000,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
  },
  ctrlBtnIcon: {
    width: 52,
    height: 52,
    fontSize: 36,
    position: 'relative',
    top: 7,
    left: 8,
  },
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 0,
  },
  colorPickerContainer: {
    width: 300,
    justifyContent: 'space-around',
  },
  radioColor: {
    // backgroundColor: 'red',
    // width: 100,
    // height: 100,
  },
  coloredCircle: {
    backgroundColor: 'transparent',
    borderRadius: 500,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
