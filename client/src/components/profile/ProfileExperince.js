import React from 'react';
import PropTypes from 'prop-types';
import { DateTime } from 'luxon';

const ProfileExperince = ({
  experience: { company, title, location, current, to, from, description },
}) => (
  <div>
    <h3 className='text-dark'>{company}</h3>
    <p>
      {DateTime.fromISO({ from }).toLocaleString(DateTime.DATETIME_SHORT)} -{' '}
      {!to
        ? ' Now'
        : DateTime.fromISO({ to }).toLocaleString(DateTime.DATETIME_SHORT)}
    </p>
    <p>
      <strong>Position: </strong> {title}
    </p>
    <p>
      <strong>Description: </strong> {description}
    </p>
  </div>
);

ProfileExperince.propTypes = {
  experience: PropTypes.array.isRequired,
};

export default ProfileExperince;
