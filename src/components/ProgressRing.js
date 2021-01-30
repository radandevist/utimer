import React, {Component} from 'react';
// import {View, Text} from 'react-native';
import {Svg, Circle} from 'react-native-svg';

export default class ProgressRing extends Component {
  constructor(props) {
    super(props);

    const {radius, stroke} = this.props;

    this.normalizedRadius = radius - stroke * 2;
    this.circumference = this.normalizedRadius * 2 * Math.PI;
  }

  render() {
    const {radius, stroke, progress, color} = this.props;

    const strokeDashoffset =
      this.circumference - (progress / 100) * this.circumference;

    return (
      <Svg height={radius * 2} width={radius * 2}>
        <Circle
          stroke={color}
          fill="transparent"
          strokeWidth={stroke}
          strokeDasharray={this.circumference + ' ' + this.circumference}
          style={{strokeDashoffset}}
          stroke-width={stroke}
          strokeLinecap="round"
          r={this.normalizedRadius}
          cx={radius}
          cy={radius}
        />
      </Svg>
    );
  }
}
