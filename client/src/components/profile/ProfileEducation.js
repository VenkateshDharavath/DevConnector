import React from 'react';
import PropTypes from 'prop-types';
import { DateTime } from 'luxon';

const ProfileEducation = ({
  education: { school, degree, fieldofstudy, current, to, from, description },
}) => (
  <div>
    <h3 className='text-dark'>{school}</h3>
    <p>
      {DateTime.fromISO({ from }).toLocaleString(DateTime.DATETIME_SHORT)} -{' '}
      {!to
        ? ' Now'
        : DateTime.fromISO({ to }).toLocaleString(DateTime.DATETIME_SHORT)}
    </p>
    <p>
      <strong>degree: </strong> {degree}
    </p>
    <p>
      <strong>fieldofstudy: </strong> {fieldofstudy}
    </p>
    <p>
      <strong>Description: </strong> {description}
    </p>
  </div>
);

ProfileEducation.propTypes = {
  education: PropTypes.array.isRequired,
};

export default ProfileEducation;
