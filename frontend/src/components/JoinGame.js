/*_____________________________________________________________________________
 * JoinGame
 * Join a game by entering a code. If code is valid, a join button is enabled.
 * Subcomponents:
 *      Typography: prompt ("Join an existing game")
 *      Textfield: for code entry
 *      Button: to join the game 
 * Properties:
*      joinText
*      buttonText
*      onChange: callback: code validation: f(code): boolean 
*      onJoin: callback for join action: f(code)
*      typographyProps 
*      textFieldProps
*      buttonProps
*      classes: applied to root element
*      className: applied to root element
* Layout
*       Vertical grid width sm=4
*       Textfiedld and button in vertical grid
*_____________________________________________________________________________
 */
import React, {useState, useRef} from 'react';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/Textfield';
import { withStyles } from '@material-ui/core/styles';
import clsx from 'clsx';


 export const styles = (theme) => ({
     root: {},
     container: {}
 });


function JoinGame(props) {

  const [buttonEnabled, setButtonEnabled] = useState(false);
  const gameCode = useRef(''); 

  const {
      joinText,
      buttonText,
      onChange,
      onJoin,
      typographyProps,
      textFieldProps,
      buttonProps,
      classes,
      className,
      widthCols
      //...other
  } = props; 

  //console.log(props);

  const jText = joinText || "Enter your game code to join an existing game"; 
  const bText = buttonText || "Join"; 

  const verticalGridProps = {
      classes: classes,
      className: clsx(className),
      container: true, 
      direction: 'column',
      alignContent: 'center',
      spacing: 1,
  }

  const horizontalGridProps = {
      container: true, 
      direction: 'row',
      justify: 'center',
      alignItems: 'center',
      spacing: 1
  }

  const internalTextFieldProps = {
      size: "small",
      variant: "outlined",
      placeholder: "Game code",
      color: "primary"
  } 
    
  const internalTypographyProps = {
      align: "center",
      variant: "h6"
  } 
    
  const internalButtonProps = {
      size: "small",
      variant: "contained",
      color: "primary"
  } 

  const verticalGridCols = widthCols || 12; 

  const CodeValidation = (e) => { 
      const isEnabled = (onChange) ?
        onChange(e.target.value):
        (e.target.value && e.target.value.length > 0);
      gameCode.current = (isEnabled) ? e.target.value:'';
      setButtonEnabled(isEnabled);
  }

  const ButtonClick = (e) => {
    if (onJoin) {
        onJoin(gameCode.current);
    } 
  }

  return (
      <Grid { ...verticalGridProps}> 
        <Grid item xs={verticalGridCols}>
            <Typography {...internalTypographyProps} {...typographyProps} > {jText} </Typography>
        </Grid> 
        <Grid item xs={verticalGridCols} {...horizontalGridProps}> 
            <Grid item>
                <TextField onChange={CodeValidation} {...internalTextFieldProps} {...textFieldProps}/>
            </Grid>
            <Grid item>
                <Button disabled={!buttonEnabled} onClick={ButtonClick} {...internalButtonProps} {...buttonProps}> {bText} </Button>
            </Grid>
        </Grid>
      </Grid>
  );
};

export default withStyles(styles, { name: 'stJoinGame' })(JoinGame);
